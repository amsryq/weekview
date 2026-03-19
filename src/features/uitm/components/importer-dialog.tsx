import { pick } from "es-toolkit";
import { AnimatePresence, animate, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { CourseEditorDialog } from "~/components/course-editor/course-editor-dialog";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
} from "~/components/ui/responsive-dialog";
import { useImporterDialogs } from "~/lib/contexts/importer-dialogs";
import { Course } from "~/lib/models/course";
import { ManualCourseProvider } from "~/lib/providers/manual-course-provider";
import { CourseStore } from "~/lib/stores/course-store";
import { CourseAndFacultySelectorStep } from "./importer/components/course-and-faculty-selector-step";
import { CourseSlipImportStep } from "./importer/components/course-slip-import-step";
import { GroupSelectorStep } from "./importer/components/group-selector-step";
import { MyStudentImportStep } from "./importer/components/my-student-import-step";
import { SourceSelectionStep } from "./importer/components/source-selection-step";
import { useImporterSelectionStore } from "./importer/utils/shared";

// TODO: Make this a primitive?
// Animates the outer shell's height by imperatively reading the inner content
// height via ResizeObserver, then driving the CSS height with framer-motion's
// animate(). This sidesteps the layout-animation conflict with fixed+translate
// CSS positioning used by the dialog.
function AnimatedStepContainer({
	stepKey,
	children,
}: {
	stepKey: string;
	children: React.ReactNode;
}) {
	const outerRef = useRef<HTMLDivElement>(null);
	const innerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const outer = outerRef.current;
		const inner = innerRef.current;
		if (!outer || !inner) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const newHeight = entry.contentRect.height;
				animate(
					outer,
					{ height: newHeight },
					{ type: "spring", bounce: 0, duration: 0.4 },
				);
			}
		});

		observer.observe(inner);
		// Set initial height without animation
		outer.style.height = `${inner.scrollHeight}px`;

		return () => observer.disconnect();
	}, []);

	return (
		// Outer shell: has an explicit pixel height that is driven by JS animation
		<div ref={outerRef} className="overflow-hidden">
			{/* Inner div: naturally sized by content, measured by ResizeObserver */}
			<div ref={innerRef}>
				<AnimatePresence mode="wait" initial={false}>
					<motion.div
						key={stepKey}
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.18, ease: "easeInOut" }}
						className="flex flex-col"
					>
						{children}
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}

export function UiTMImporterDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { currentStep, setOpen, reset } = useImporterSelectionStore(
		useShallow((state) => pick(state, ["currentStep", "setOpen", "reset"])),
	);

	const closeImporter = useCallback(() => {
		setOpen(false);
		reset();
		onOpenChange(false);
	}, [reset, setOpen, onOpenChange]);

	const handleOpenChange = useCallback(
		(nextOpen: boolean) => {
			if (!nextOpen) {
				closeImporter();
				return;
			}
			setOpen(true);
			onOpenChange(true);
		},
		[closeImporter, setOpen, onOpenChange],
	);

	const renderStep = () => {
		switch (currentStep) {
			case "source":
				return <SourceSelectionStep />;
			case "campus-faculty":
				return <CourseAndFacultySelectorStep />;
			case "group-selector":
				return <GroupSelectorStep />;
			case "course-slip":
				return <CourseSlipImportStep />;
			case "my-student":
				return <MyStudentImportStep />;
			default:
				return null;
		}
	};

	return (
		<ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-xl overflow-hidden"
				mobileClassName="max-h-[92dvh]"
			>
				<AnimatedStepContainer stepKey={currentStep}>
					{renderStep()}
				</AnimatedStepContainer>
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}

// Global renderer for UiTM importer dialog
export function UiTMImporterDialogRenderer() {
	const { uiTMImporterOpen, closeUiTMImporter } = useImporterDialogs();
	return (
		<UiTMImporterDialog
			open={uiTMImporterOpen}
			onOpenChange={closeUiTMImporter}
		/>
	);
}

// Global renderer for Manual importer dialog (CourseEditorDialog)
export function ManualImporterDialogRenderer() {
	const { manualImporterOpen, closeManualImporter } = useImporterDialogs();
	// Add course logic
	return (
		<CourseEditorDialog
			open={manualImporterOpen}
			onOpenChange={closeManualImporter}
			title="Add Course"
			onSubmit={(data, form) => {
				const course = Course.createFromSchema(
					data,
					ManualCourseProvider.instance,
				);
				const conflicts = CourseStore.getState().getConflictingCourses(
					course.meetingTimes,
				);
				if (conflicts.length > 0) {
					form.setFieldMeta("meetingTimes", (prev) => ({
						...prev,
						errorMap: {
							onSubmit: `There are time conflicts with ${conflicts.map((c) => c.code).join(", ")}.`,
						},
					}));
					return;
				}

				CourseStore.getState().addCourse(course);
			}}
		/>
	);
}
