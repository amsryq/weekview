import {
	AlertCircle,
	ArrowLeft,
	CheckIcon,
	Loader2,
	XIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
	ResponsiveDialog,
	ResponsiveDialogContent,
	ResponsiveDialogDescription,
	ResponsiveDialogHeader,
	ResponsiveDialogTitle,
} from "~/components/ui/responsive-dialog";
import { Switch } from "~/components/ui/switch";
import {
	CANCELLED_MESSAGE,
	useMyStudentImporter,
} from "../hooks/use-my-student-importer";
import { getFriendlyUiTMErrorMessage } from "../utils/error-feedback";
import {
	CourseImportProgress,
	getProgressCounts,
	useImporterSelectionStore,
} from "../utils/shared";

export function MyStudentImportStep() {
	const [studentId, setStudentId] = useState("");
	const [includeCourseName, setIncludeCourseName] = useState(false);
	const [progressDialogOpen, setProgressDialogOpen] = useState(false);
	const setCurrentStep = useImporterSelectionStore(
		(state) => state.setCurrentStep,
	);

	const {
		courseProgress,
		importPhase,
		isPending,
		cancelRequested,
		importError,
		handleImport,
		requestCancel,
	} = useMyStudentImporter();

	const onStartImport = async () => {
		setProgressDialogOpen(true);
		await handleImport({ studentId, includeCourseName });
	};

	const { successCount, errorCount } = useMemo(
		() => getProgressCounts(courseProgress),
		[courseProgress],
	);

	const isImporting = importPhase === "fetching" || importPhase === "importing";
	const isCancelled = importPhase === "cancelled";
	const isComplete = importPhase === "complete";
	const showImportError =
		Boolean(importError) && importError?.message !== CANCELLED_MESSAGE;
	const friendlyImportError = showImportError
		? getFriendlyUiTMErrorMessage(importError)
		: null;

	const progressTitle = showImportError
		? "Import failed"
		: importPhase === "fetching"
			? "Fetching timetable..."
			: importPhase === "importing"
				? "Importing courses"
				: isCancelled
					? "Import cancelled"
					: isComplete && errorCount > 0
						? "Import completed with issues"
						: isComplete
							? "Import complete"
							: "Preparing import";

	const progressSubtitle = showImportError
		? "Please review the message below, then update your student ID or retry later."
		: importPhase === "fetching"
			? "Contacting UiTM MyStudent API..."
			: importPhase === "importing"
				? `Processing ${courseProgress.length} course${courseProgress.length === 1 ? "" : "s"}...`
				: isCancelled
					? "Stopped early at your request"
					: isComplete
						? `${successCount} imported • ${errorCount} failed`
						: "Ready to import";

	return (
		<>
			<ResponsiveDialogHeader className="gap-1">
				<ResponsiveDialogTitle>Import from MyStudent</ResponsiveDialogTitle>
				<ResponsiveDialogDescription>
					Enter your student ID to fetch from the portal.
				</ResponsiveDialogDescription>
			</ResponsiveDialogHeader>

			<div className="flex-1 flex flex-col gap-4 px-6 py-2 overflow-y-auto min-h-0">
				<div className="space-y-1.5 px-1">
					<Label
						htmlFor="student-id"
						className="text-xs font-bold text-muted-foreground/80"
					>
						Student ID
					</Label>
					<Input
						id="student-id"
						type="text"
						value={studentId}
						inputMode="numeric"
						onChange={(event) => setStudentId(event.target.value)}
						placeholder="202X..."
						className="h-9 text-sm"
					/>
				</div>

				<div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 p-3">
					<div className="flex flex-col">
						<Label
							htmlFor="include-course-name"
							className="text-xs font-semibold cursor-pointer"
						>
							Include course names
						</Label>
						<span className="text-[10px] text-muted-foreground">
							Show full names in timetable entries
						</span>
					</div>
					<Switch
						id="include-course-name"
						checked={includeCourseName}
						onCheckedChange={setIncludeCourseName}
						className="scale-90"
					/>
				</div>

				{showImportError && (
					<Alert variant="destructive" className="py-2.5">
						<AlertTitle className="text-xs font-bold">Import failed</AlertTitle>
						<AlertDescription className="text-xs opacity-90">
							{importError?.message}
						</AlertDescription>
					</Alert>
				)}
			</div>

			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-6 mt-auto">
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
					onClick={onStartImport}
					disabled={isPending || studentId.trim() === ""}
					size="sm"
					className="w-full sm:w-auto"
				>
					{isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
					Import
				</Button>
			</div>

			<ResponsiveDialog
				open={progressDialogOpen}
				onOpenChange={(open) => {
					if (!isImporting) {
						setProgressDialogOpen(open);
					}
				}}
			>
				<ResponsiveDialogContent
					desktopClassName="sm:max-w-xl"
					mobileClassName="max-h-[95dvh]"
				>
					<ResponsiveDialogHeader className="gap-1">
						<ResponsiveDialogTitle className="flex items-center gap-2">
							{showImportError ? (
								<AlertCircle className="size-4 text-destructive" />
							) : isImporting ? (
								<Loader2 className="size-4 animate-spin text-primary" />
							) : errorCount > 0 ? (
								<AlertCircle className="size-4 text-amber-500" />
							) : (
								<CheckIcon className="size-4 text-emerald-500" />
							)}
							<span className="text-base">{progressTitle}</span>
						</ResponsiveDialogTitle>
						<ResponsiveDialogDescription className="text-xs">
							{progressSubtitle}
						</ResponsiveDialogDescription>
					</ResponsiveDialogHeader>

					<div className="flex-1 py-2 px-6 overflow-y-auto min-h-0">
						{showImportError ? (
							<Alert variant="destructive" className="py-2.5">
								<AlertTitle className="text-xs font-bold">
									Import failed
								</AlertTitle>
								<AlertDescription className="text-xs opacity-90">
									{friendlyImportError}
								</AlertDescription>
							</Alert>
						) : courseProgress.length > 0 ? (
							<div className="overflow-hidden rounded-xl border border-border/60 bg-card">
								<div className="border-b border-border/60 bg-muted/40 px-3 py-2">
									<h3 className="text-xs font-bold text-muted-foreground/80">
										Courses
									</h3>
								</div>
								<div className="max-h-[300px] overflow-y-auto">
									<div className="divide-y divide-border/60">
										{courseProgress.map((item: CourseImportProgress) => (
											<div
												key={`${item.courseCode}-${item.group}`}
												className="flex items-center justify-between px-3 py-2.5 hover:bg-primary/5 transition-colors"
											>
												<div className="flex-1 min-w-0">
													<div className="flex items-baseline gap-2">
														<span className="font-semibold text-sm">
															{item.courseCode}
														</span>
														{item.courseName && (
															<span className="text-[11px] text-muted-foreground">
																{item.courseName}
															</span>
														)}
													</div>
													<div className="flex items-center gap-2">
														<span className="text-[11px] font-medium text-muted-foreground/80">
															{item.group}
														</span>
														{item.reason && item.status === "error" && (
															<span className="text-[10px] text-destructive font-medium">
																• {item.reason}
															</span>
														)}
													</div>
												</div>
												<div className="shrink-0 ml-3">
													{item.status === "pending" ? (
														<div className="size-4 rounded-full border border-muted-foreground/30" />
													) : item.status === "running" ? (
														<Loader2 className="size-4 animate-spin text-primary" />
													) : item.status === "success" ? (
														<div className="size-4 rounded-full bg-emerald-500 flex items-center justify-center">
															<CheckIcon className="size-2.5 text-white" />
														</div>
													) : (
														<div className="size-4 rounded-full bg-destructive flex items-center justify-center">
															<XIcon className="size-2.5 text-white" />
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						) : (
							<div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center text-xs text-muted-foreground">
								Waiting for data...
							</div>
						)}
					</div>

					<div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between p-6 mt-auto">
						<Button
							variant="ghost"
							size="sm"
							onClick={requestCancel}
							className="w-full sm:w-auto"
							disabled={!isImporting || cancelRequested}
						>
							Cancel
						</Button>

						<Button
							variant="secondary"
							size="sm"
							onClick={() => setProgressDialogOpen(false)}
							className="w-full sm:w-auto"
							disabled={isImporting && !cancelRequested && !showImportError}
						>
							Close
						</Button>
					</div>
				</ResponsiveDialogContent>
			</ResponsiveDialog>
		</>
	);
}
