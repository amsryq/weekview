import { ArrowLeft, Loader2, ScrollText } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";
import { Textarea } from "~/components/ui/textarea";
import { useCampusFacultyQueries } from "../hooks/use-campus-faculty-queries";
import { useImportProcess } from "../hooks/use-import-process";
import { useImportSelection } from "../hooks/use-import-selection";
import { useParsedSchedule } from "../hooks/use-parsed-schedule";
import { useImporterSelectionStore } from "../utils/shared";
import { CampusFacultySelector } from "./course-slip-import-step/campus-faculty-selector";
import { HowToImportDialog } from "./course-slip-import-step/how-to-import-dialog";
import { ImportProgressDialog } from "./course-slip-import-step/import-progress-dialog";

function formatDetectedLabel(code?: string, name?: string): string {
	if (!code) return "";
	return name ? `${code} - ${name}` : code;
}

interface CourseSlipImportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function CourseSlipImportStepBody() {
	const [rawText, setRawText] = useState("");
	const [howToOpen, setHowToOpen] = useState(false);

	const importerOpen = useImporterSelectionStore((state) => state.open);
	const parsedSchedule = useParsedSchedule(rawText);

	const { selectedCampus, selectedFaculty, setCurrentStep } =
		useImporterSelectionStore(
			useShallow((state) => ({
				selectedCampus: state.selectedCampus,
				selectedFaculty: state.selectedFaculty,
				setCurrentStep: state.setCurrentStep,
			})),
		);

	const { campuses, loadingCampuses, faculties, loadingFaculties } =
		useCampusFacultyQueries({ importerOpen, selectedCampus });

	const {
		isAutoSelection,
		campusMismatch,
		facultyMismatch,
		requiresFacultyInAuto,
		shouldShowParsedFaculty,
		canImport,
		onCampusChange,
		onFacultyChange,
	} = useImportSelection({
		rawText,
		parsedSchedule,
		campuses,
	});

	const {
		isPending,
		campusInfo,
		courseProgress,
		cancelRequested,
		progressDialogOpen,
		setProgressDialogOpen,
		isImporting,
		errorCount,
		progressTitle,
		progressSubtitle,
		requestCancel,
		performImport,
	} = useImportProcess({
		selectedCampus,
		selectedFaculty,
		onImportSuccess: (result) => {
			onCampusChange(result.campus);
			onFacultyChange(result.faculty);
		},
		importerOpen,
	});

	const detectedCampusCode = parsedSchedule.campus?.code ?? "";
	const detectedFacultyCode = parsedSchedule.faculty?.code ?? "";

	const detectedCampusLabel = formatDetectedLabel(
		parsedSchedule.campus?.code,
		parsedSchedule.campus?.name,
	);
	const detectedFacultyLabel = formatDetectedLabel(
		parsedSchedule.faculty?.code,
		parsedSchedule.faculty?.name,
	);

	const showParsedPanel = rawText.trim() !== "";
	const coursePreview = parsedSchedule.courses.slice(0, 8);
	const remainingCourses = parsedSchedule.courses.length - 8;
	const suggestedFaculty = detectedFacultyLabel;

	const handleImport = async () => {
		if (canImport) {
			await performImport(parsedSchedule);
		}
	};

	return (
		<>
			<ResponsiveDialogHeader className="gap-1">
				<ResponsiveDialogTitle className="flex items-center gap-2 text-lg">
					<span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
						<ScrollText className="size-4" />
					</span>
					Import from registration slip
				</ResponsiveDialogTitle>
				<ResponsiveDialogDescription>
					Paste the text from your UiTM registration/course slip. Weekview will
					match the courses and groups automatically.
				</ResponsiveDialogDescription>
			</ResponsiveDialogHeader>

			<div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 min-h-0">
				<Textarea
					value={rawText}
					onChange={(event) => setRawText(event.target.value)}
					placeholder="Paste your course slip here..."
					className="max-h-48 min-h-24 resize-y"
				/>

				{showParsedPanel && (
					<div className="overflow-x-auto overflow-y-clip whitespace-nowrap rounded-lg border border-border bg-muted/30 p-4 space-y-3">
						<div className="text-sm font-medium">Campus & Faculty</div>
						<CampusFacultySelector
							campuses={campuses}
							faculties={faculties}
							selectedCampus={selectedCampus}
							selectedFaculty={selectedFaculty}
							detectedCampusLabel={detectedCampusLabel}
							detectedFacultyLabel={detectedFacultyLabel}
							detectedCampusCode={detectedCampusCode}
							detectedFacultyCode={detectedFacultyCode}
							isAutoSelection={isAutoSelection}
							loadingCampuses={loadingCampuses}
							loadingFaculties={loadingFaculties}
							campusMismatch={campusMismatch}
							facultyMismatch={facultyMismatch}
							requiresFacultyInAuto={requiresFacultyInAuto}
							shouldShowParsedFaculty={shouldShowParsedFaculty}
							suggestedFaculty={suggestedFaculty}
							onCampusChange={onCampusChange}
							onFacultyChange={onFacultyChange}
						/>
						<div className="pt-2">
							<div className="text-sm font-medium text-foreground">Courses</div>
							{coursePreview.length > 0 ? (
								<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
									{coursePreview.map((course, idx) => (
										<li key={`${course.courseCode}-${idx}`}>
											<span className="font-medium text-foreground">
												{course.courseCode}
											</span>{" "}
											– {course.name} ({course.group})
										</li>
									))}
									{remainingCourses > 0 && (
										<li className="italic">
											+{remainingCourses} more entr
											{remainingCourses === 1 ? "y" : "ies"}
										</li>
									)}
								</ul>
							) : (
								<div className="text-sm text-muted-foreground">
									No courses recognised yet.
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-6 mt-auto">
				<div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:w-auto">
					<Button
						variant="outline"
						onClick={() => setCurrentStep("source")}
						className="w-full sm:w-auto"
					>
						<ArrowLeft className="size-4" />
						Back to selection
					</Button>
					<Button
						variant="ghost"
						onClick={() => setHowToOpen(true)}
						className="w-full sm:w-auto"
					>
						How to?
					</Button>
				</div>
				<Button
					onClick={handleImport}
					disabled={!canImport}
					className="w-full sm:w-auto"
				>
					{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
					Import courses
				</Button>
			</div>

			<HowToImportDialog open={howToOpen} onOpenChange={setHowToOpen} />

			<ImportProgressDialog
				open={progressDialogOpen}
				onOpenChange={setProgressDialogOpen}
				isImporting={isImporting}
				cancelRequested={cancelRequested}
				progressTitle={progressTitle}
				progressSubtitle={progressSubtitle}
				errorCount={errorCount}
				campusInfo={campusInfo}
				courseProgress={courseProgress}
				onRequestCancel={requestCancel}
			/>
		</>
	);
}

export function CourseSlipImportDialog({
	open,
	onOpenChange,
}: CourseSlipImportDialogProps) {
	return (
		<ResponsiveDialog open={open} onOpenChange={onOpenChange}>
			<ResponsiveDialogContent
				desktopClassName="sm:max-w-2xl"
				mobileClassName="max-h-[95dvh]"
			>
				<CourseSlipImportStepBody />
			</ResponsiveDialogContent>
		</ResponsiveDialog>
	);
}
