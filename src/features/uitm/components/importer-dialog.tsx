import { pick } from "es-toolkit";
import { JSX, useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { CourseAndFacultySelectorDialog } from "./importer/course-and-faculty-selector-step";
import { CourseSlipImportDialog } from "./importer/course-slip-import-step";
import { GroupSelectorDialog } from "./importer/group-selector-step";
import { MyStudentImportDialog } from "./importer/my-student-import-step";
import { ImporterStep, useImporterSelectionStore } from "./importer/shared";
import { SourceSelectionDialog } from "./importer/source-selection-step";

export function UiTMImporterDialog({ children }: { children: JSX.Element }) {
	const { open, currentStep, setOpen, setCurrentStep, reset } =
		useImporterSelectionStore(
			useShallow((state) =>
				pick(state, [
					"open",
					"currentStep",
					"setOpen",
					"setCurrentStep",
					"reset",
				]),
			),
		);

	const closeImporter = useCallback(() => {
		setOpen(false);
		reset();
	}, [reset, setOpen]);

	const handleOpenChange = useCallback(
		(nextOpen: boolean, restoreToStep?: ImporterStep) => {
			if (!nextOpen) {
				closeImporter();
				return;
			}

			setOpen(true);
			if (restoreToStep) {
				setCurrentStep(restoreToStep);
			}
		},
		[closeImporter, setCurrentStep, setOpen],
	);

	return (
		<>
			<SourceSelectionDialog
				trigger={children}
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
