import { pick } from "es-toolkit";
import { LoaderCircle } from "lucide-react";
import { lazy, Suspense, useCallback } from "react";
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
import { useImporterSelectionStore } from "./importer/utils/shared";

const UiTMImporterDialogContentLazy = lazy(
	() => import("./uitm-importer-dialog-content"),
);

export function UiTMImporterDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const setOpen = useImporterSelectionStore((s) => s.setOpen);

	const closeImporter = useCallback(() => {
		setOpen(false);
		onOpenChange(false);
	}, [setOpen, onOpenChange]);

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

	return (
		<ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-xl overflow-hidden"
				mobileClassName="max-h-[92dvh]"
			>
				<Suspense
					fallback={
						<div className="flex-1 flex items-center justify-center min-h-0 py-12">
							<LoaderCircle className="size-6 animate-spin text-muted-foreground" />
						</div>
					}
				>
					<UiTMImporterDialogContentLazy />
				</Suspense>
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
