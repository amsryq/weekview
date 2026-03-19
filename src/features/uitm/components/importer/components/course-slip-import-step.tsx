import { ArrowLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "~/components/ui/button";
import {
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

export function CourseSlipImportStep() {
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
				<ResponsiveDialogTitle>
					Import from registration slip
				</ResponsiveDialogTitle>
				<ResponsiveDialogDescription>
					Paste your UiTM registration slip text.
				</ResponsiveDialogDescription>
			</ResponsiveDialogHeader>

			<div className="flex-1 flex flex-col gap-4 overflow-y-auto px-6 py-2 min-h-0">
				<Textarea
					value={rawText}
					onChange={(event) => setRawText(event.target.value)}
					placeholder="Paste your course slip here..."
					className="max-h-32 min-h-20 resize-y text-sm"
				/>

				{showParsedPanel && (
					<div className="overflow-hidden rounded-xl border border-border/60 bg-muted/30">
						<div className="border-b border-border/60 bg-muted/40 px-3 py-2">
							<h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80">
								Detected Details
							</h3>
						</div>
						<div className="p-3 space-y-4">
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

							<div className="space-y-2">
								<h4 className="text-[11px] font-semibold text-foreground/70 uppercase tracking-wider">
									Recognised Courses
								</h4>
								{coursePreview.length > 0 ? (
									<ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
										{coursePreview.map((course, idx) => (
											<li
												key={`${course.courseCode}-${idx}`}
												className="flex items-center gap-1.5"
											>
												<span className="font-bold text-foreground">
													{course.courseCode}
												</span>
												<span className="opacity-60">•</span>
												<span className="truncate">{course.group}</span>
											</li>
										))}
										{remainingCourses > 0 && (
											<li className="italic opacity-60">
												+{remainingCourses} more
											</li>
										)}
									</ul>
								) : (
									<div className="text-xs text-muted-foreground">
										No courses recognised yet.
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-6 mt-auto">
				<div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:w-auto">
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setCurrentStep("source")}
						className="w-full sm:w-auto"
					>
						<ArrowLeft className="size-4 mr-2" />
						Back
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => setHowToOpen(true)}
						className="w-full sm:w-auto"
					>
						How to?
					</Button>
				</div>
				<Button
					onClick={handleImport}
					disabled={!canImport}
					size="sm"
					className="w-full sm:w-auto"
				>
					{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
					Import
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
