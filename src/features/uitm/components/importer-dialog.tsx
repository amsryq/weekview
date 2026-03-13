import { pick } from "es-toolkit";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { CourseEditorDialog } from "~/components/course-editor/course-editor-dialog";
import { useImporterDialogs } from "~/lib/contexts/importer-dialogs";
import { Course } from "~/lib/models/course";
import { ManualCourseProvider } from "~/lib/providers/manual-course-provider";
import { CourseStore } from "~/lib/stores/course-store";
import { CourseAndFacultySelectorDialog } from "./importer/course-and-faculty-selector-step";
import { CourseSlipImportDialog } from "./importer/course-slip-import-step";
import { GroupSelectorDialog } from "./importer/group-selector-step";
import { MyStudentImportDialog } from "./importer/my-student-import-step";
import { ImporterStep, useImporterSelectionStore } from "./importer/shared";
import { SourceSelectionDialog } from "./importer/source-selection-step";

export function UiTMImporterDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { currentStep, setOpen, setCurrentStep, reset } =
		useImporterSelectionStore(
			useShallow((state) =>
				pick(state, ["currentStep", "setOpen", "setCurrentStep", "reset"]),
			),
		);

	const closeImporter = useCallback(() => {
		setOpen(false);
		reset();
		onOpenChange(false);
	}, [reset, setOpen, onOpenChange]);

	const handleOpenChange = useCallback(
		(nextOpen: boolean, restoreToStep?: ImporterStep) => {
			if (!nextOpen) {
				closeImporter();
				return;
			}
			setOpen(true);
			onOpenChange(true);
			if (restoreToStep) {
				setCurrentStep(restoreToStep);
			}
		},
		[closeImporter, setCurrentStep, setOpen, onOpenChange],
	);

	return (
		<>
			<SourceSelectionDialog
				trigger={null}
				open={open && currentStep === "source"}
				onOpenChange={(value) => handleOpenChange(value, "source")}
			/>
			<CourseAndFacultySelectorDialog
				open={open && currentStep === "campus-faculty"}
				onOpenChange={(value) => handleOpenChange(value)}
			/>
			<GroupSelectorDialog
				open={open && currentStep === "group-selector"}
				onOpenChange={(value) => handleOpenChange(value)}
			/>
			<CourseSlipImportDialog
				open={open && currentStep === "course-slip"}
				onOpenChange={(value) => handleOpenChange(value)}
			/>
			<MyStudentImportDialog
				open={open && currentStep === "my-student"}
				onOpenChange={(value) => handleOpenChange(value)}
			/>
		</>
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
