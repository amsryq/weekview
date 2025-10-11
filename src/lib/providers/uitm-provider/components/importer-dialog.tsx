import { pick } from "es-toolkit";
import { JSX } from "react";
import { useShallow } from "zustand/react/shallow";
import { Dialog, DialogContent, DialogTrigger } from "~/components/ui/dialog";
import { CourseAndFacultySelectorStep } from "./importer/course-and-faculty-selector-step";
import { CourseSlipImportStep } from "./importer/course-slip-import-step";
import { GroupSelectorStep } from "./importer/group-selector-step";
import { MyStudentImportStep } from "./importer/my-student-import-step";
import { useImporterSelectionStore } from "./importer/shared";
import { SourceSelectionStep } from "./importer/source-selection-step";

export default function UiTMImporterDialog({
	children,
}: {
	children: JSX.Element;
}) {
	const { open, setOpen, currentStep, setCurrentStep } =
		useImporterSelectionStore(
			useShallow((s) =>
				pick(s, ["open", "setOpen", "currentStep", "setCurrentStep"]),
			),
		);

	const handleOpenChange = (open: boolean) => {
		setOpen(open);
		if (!open) {
			setCurrentStep(0);
		}
	};

	return (
		<>
			<Dialog open={open && currentStep === 0} onOpenChange={handleOpenChange}>
				<DialogTrigger asChild>{children}</DialogTrigger>
				<DialogContent className="flex flex-col sm:max-w-xl min-w-0">
					<SourceSelectionStep />
				</DialogContent>
			</Dialog>
			<Dialog open={open && currentStep === 1} onOpenChange={handleOpenChange}>
				<DialogContent className="flex flex-col sm:max-w-xl min-w-0">
					<CourseAndFacultySelectorStep
						onOpenImport={() => setCurrentStep(3)}
					/>
				</DialogContent>
			</Dialog>
			<Dialog open={open && currentStep === 2} onOpenChange={handleOpenChange}>
				<DialogContent className="flex flex-col sm:max-w-4xl min-w-0">
					<GroupSelectorStep />
				</DialogContent>
			</Dialog>
			<Dialog open={open && currentStep === 3} onOpenChange={handleOpenChange}>
				<DialogContent className="flex flex-col sm:max-w-2xl min-w-0">
					<CourseSlipImportStep />
				</DialogContent>
			</Dialog>
			<Dialog open={open && currentStep === 4} onOpenChange={handleOpenChange}>
				<DialogContent className="flex flex-col sm:max-w-2xl min-w-0">
					<MyStudentImportStep />
				</DialogContent>
			</Dialog>
		</>
	);
}
