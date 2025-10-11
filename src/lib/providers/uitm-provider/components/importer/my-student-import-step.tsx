import { useMutation } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowLeft,
	CheckIcon,
	GraduationCap,
	Loader2,
	XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { CourseStore } from "~/lib/stores/course-store";
import { UiTMGroup } from "../../group";
import { fetchMyStudentTimetable } from "../../models/mystudent";
import {
	CourseImportProgress,
	ImportFailure,
	ImportSuccess,
	normalizeString,
	ProgressStatus,
	useImporterSelectionStore,
} from "./shared";

interface MyStudentImportDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const CANCELLED_MESSAGE = "Import cancelled";

function MyStudentImportContent() {
	const setCurrentStep = useImporterSelectionStore(
		(state) => state.setCurrentStep,
	);
	const importerOpen = useImporterSelectionStore((state) => state.open);

	const [studentId, setStudentId] = useState("");
	const [includeCourseName, setIncludeCourseName] = useState(false);
	const [progressDialogOpen, setProgressDialogOpen] = useState(false);
	const [importPhase, setImportPhase] = useState<
		"idle" | "fetching" | "importing" | "cancelled" | "complete"
	>("idle");
	const [courseProgress, setCourseProgress] = useState<CourseImportProgress[]>(
		[],
	);
	const cancelRequestedRef = useRef(false);
	const [cancelRequested, setCancelRequested] = useState(false);

	useEffect(() => {
		if (!importerOpen) {
			setProgressDialogOpen(false);
			setImportPhase("idle");
			setCourseProgress([]);
			cancelRequestedRef.current = false;
			setCancelRequested(false);
		}
	}, [importerOpen]);

	const applyCancellation = (reason = CANCELLED_MESSAGE) => {
		setImportPhase((prev) => (prev === "cancelled" ? prev : "cancelled"));
		setCourseProgress((prev) =>
			prev.map((item) =>
				item.status === "pending" || item.status === "running"
					? { ...item, status: "error", reason }
					: item,
			),
		);
	};

	const requestCancel = () => {
		if (cancelRequestedRef.current) return;
		cancelRequestedRef.current = true;
		setCancelRequested(true);
		applyCancellation();
	};

	const importMutation = useMutation<
		{ successes: ImportSuccess[]; failures: ImportFailure[] },
		Error,
		{ id: string; includeName: boolean }
	>({
		mutationFn: async ({ id, includeName }) => {
			const trimmedId = id.trim();
			if (!trimmedId) {
				throw new Error("Please enter your student ID before importing.");
			}

			setImportPhase("fetching");
			const ensureNotCancelled = () => {
				if (!cancelRequestedRef.current) return;
				applyCancellation();
				throw new Error(CANCELLED_MESSAGE);
			};

			ensureNotCancelled();

			const groups = await fetchMyStudentTimetable({
				studentId: trimmedId,
				includeCourseName: includeName,
			});
			ensureNotCancelled();

			if (!groups.length) {
				setImportPhase("complete");
				throw new Error(
					"No timetable entries were returned for that student ID.",
				);
			}

			const initialProgress: CourseImportProgress[] = groups.map((group) => ({
				courseCode: group.internal.code,
				courseName: group.name,
				group: group.internal.group,
				status: "pending",
			}));
			setCourseProgress(initialProgress);
			ensureNotCancelled();

			setImportPhase("importing");
			const dedupeKeys = new Set<string>();
			const successes: ImportSuccess[] = [];
			const failures: ImportFailure[] = [];

			const updateCourseStatus = (
				courseCode: string,
				groupCode: string,
				status: ProgressStatus,
				reason?: string,
			) => {
				setCourseProgress((prev) =>
					prev.map((item) =>
						item.courseCode === courseCode && item.group === groupCode
							? { ...item, status, reason }
							: item,
					),
				);
			};

			for (const group of groups) {
				ensureNotCancelled();
				const courseCode = group.internal.code;
				const groupCode = group.internal.group;

				updateCourseStatus(courseCode, groupCode, "running");

				const dedupeKey = `${normalizeString(courseCode)}__${normalizeString(groupCode)}`;
				if (dedupeKeys.has(dedupeKey)) {
					updateCourseStatus(courseCode, groupCode, "error", "Duplicate entry");
					failures.push({
						courseCode,
						group: groupCode,
						reason: "Duplicate entry in MyStudent timetable.",
					});
					continue;
				}
				dedupeKeys.add(dedupeKey);

				const storeState = CourseStore.getState();

				const alreadyExists = storeState.courses.some(
					(courseItem) =>
						courseItem instanceof UiTMGroup &&
						normalizeString(courseItem.internal.code) ===
							normalizeString(courseCode) &&
						normalizeString(courseItem.internal.group) ===
							normalizeString(groupCode),
				);

				if (alreadyExists) {
					updateCourseStatus(
						courseCode,
						groupCode,
						"error",
						"Already in timetable",
					);
					failures.push({
						courseCode,
						group: groupCode,
						reason: "This group is already in your timetable.",
					});
					continue;
				}

				const conflicts = storeState.getConflictingCourses(group.meetingTimes);
				if (conflicts.length > 0) {
					const conflictMsg = `Conflicts with ${conflicts.map((c) => c.code).join(", ")}`;
					updateCourseStatus(courseCode, groupCode, "error", conflictMsg);
					failures.push({
						courseCode,
						group: groupCode,
						reason: `Time conflict with ${conflicts.map((c) => c.code).join(", ")}.`,
					});
					continue;
				}

				try {
					CourseStore.getState().addCourse(group);
					updateCourseStatus(courseCode, groupCode, "success");
					successes.push({ courseCode, group: groupCode });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add course";
					updateCourseStatus(courseCode, groupCode, "error", message);
					failures.push({
						courseCode,
						group: groupCode,
						reason: message,
					});
				}
			}

			ensureNotCancelled();
			setImportPhase("complete");
			return { successes, failures };
		},
	});

	const successCount = useMemo(
		() => courseProgress.filter((item) => item.status === "success").length,
		[courseProgress],
	);
	const errorCount = useMemo(
		() => courseProgress.filter((item) => item.status === "error").length,
		[courseProgress],
	);

	const isImporting = importPhase === "fetching" || importPhase === "importing";
	const isCancelled = importPhase === "cancelled";
	const isComplete = importPhase === "complete";
	const showImportError =
		Boolean(importMutation.error) &&
		importMutation.error?.message !== CANCELLED_MESSAGE;

	const progressTitle = isImporting
		? importPhase === "fetching"
			? "Fetching timetable..."
			: "Importing courses"
		: isCancelled
			? "Import cancelled"
			: isComplete && errorCount > 0
				? "Import completed with issues"
				: isComplete
					? "Import complete"
					: "Preparing import";

	const progressSubtitle = isImporting
		? importPhase === "fetching"
			? "Contacting UiTM MyStudent API..."
			: `Processing ${courseProgress.length} course${courseProgress.length === 1 ? "" : "s"}...`
		: isCancelled
			? "Stopped early at your request"
			: isComplete
				? `${successCount} imported • ${errorCount} failed`
				: "Ready to import";

	const handleImport = async () => {
		importMutation.reset();
		setCourseProgress([]);
		setImportPhase("idle");
		cancelRequestedRef.current = false;
		setCancelRequested(false);
		setProgressDialogOpen(true);

		try {
			await importMutation.mutateAsync({
				id: studentId,
				includeName: includeCourseName,
			});
		} catch {
			// errors handled via mutation state and progress tracking
		}
	};

	return (
		<>
			<DialogHeader className="gap-1 text-left">
				<DialogTitle className="flex items-center gap-2 text-lg">
					<span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
						<GraduationCap className="size-4" />
					</span>
					Import from MyStudent
				</DialogTitle>
				<DialogDescription>
					Enter your UiTM student ID and we will fetch the timetable directly
					from the MyStudent portal.
				</DialogDescription>
			</DialogHeader>

			<div className="flex flex-col gap-4">
				<Input
					type="text"
					value={studentId}
					inputMode="numeric"
					onChange={(event) => setStudentId(event.target.value)}
					placeholder="Enter your student ID"
				/>

				<div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
					<div className="flex flex-col gap-1">
						<Label
							htmlFor="include-course-name"
							className="text-sm font-medium cursor-pointer"
						>
							Include course names
						</Label>
						<span className="text-xs text-muted-foreground">
							Show full course names in timetable entries
						</span>
					</div>
					<Switch
						id="include-course-name"
						checked={includeCourseName}
						onCheckedChange={setIncludeCourseName}
					/>
				</div>

				{showImportError && (
					<Alert variant="destructive">
						<AlertTitle>Import failed</AlertTitle>
						<AlertDescription>{importMutation.error?.message}</AlertDescription>
					</Alert>
				)}
			</div>

			<DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<Button
					variant="outline"
					onClick={() => setCurrentStep("source")}
					className="w-full sm:w-auto"
				>
					<ArrowLeft className="size-4" />
					Back to selection
				</Button>
				<Button
					onClick={handleImport}
					disabled={importMutation.isPending || studentId.trim() === ""}
					className="w-full sm:w-auto"
				>
					{importMutation.isPending && (
						<Loader2 className="mr-2 size-4 animate-spin" />
					)}
					Import timetable
				</Button>
			</DialogFooter>

			<Dialog
				open={progressDialogOpen}
				onOpenChange={(open) => {
					if (!isImporting) {
						setProgressDialogOpen(open);
					}
				}}
			>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{isImporting ? (
								<Loader2 className="size-5 animate-spin text-primary" />
							) : errorCount > 0 ? (
								<AlertCircle className="size-5 text-amber-500" />
							) : (
								<CheckIcon className="size-5 text-emerald-500" />
							)}
							<span>{progressTitle}</span>
						</DialogTitle>
						<DialogDescription>{progressSubtitle}</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4 overflow-y-auto">
						{courseProgress.length > 0 ? (
							<div className="rounded-lg border bg-background">
								<div className="border-b bg-muted/30 px-4 py-3">
									<h3 className="text-sm font-semibold">Courses</h3>
								</div>
								<div className="max-h-[400px] overflow-y-auto">
									<div className="divide-y">
										{courseProgress.map((item, idx) => (
											<div
												key={`${item.courseCode}-${item.group}-${idx}`}
												className="flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
											>
												<div className="flex-1 min-w-0">
													<div className="flex items-baseline gap-2">
														<span className="font-medium text-sm">
															{item.courseCode}
														</span>
														{item.courseName && (
															<span className="text-xs text-muted-foreground truncate">
																{item.courseName}
															</span>
														)}
													</div>
													<div className="flex items-center gap-2 mt-0.5">
														<span className="text-xs text-muted-foreground">
															{item.group}
														</span>
														{item.reason && item.status === "error" && (
															<span className="text-xs text-destructive">
																• {item.reason}
															</span>
														)}
													</div>
												</div>
												<div className="flex-shrink-0 ml-3">
													{item.status === "pending" ? (
														<div className="size-5 rounded-full border-2 border-muted-foreground/30" />
													) : item.status === "running" ? (
														<Loader2 className="size-5 animate-spin text-primary" />
													) : item.status === "success" ? (
														<div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center">
															<CheckIcon className="size-3 text-white" />
														</div>
													) : (
														<div className="size-5 rounded-full bg-destructive flex items-center justify-center">
															<XIcon className="size-3 text-white" />
														</div>
													)}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						) : (
							<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
								No courses loaded yet.
							</div>
						)}
					</div>

					<DialogFooter className="flex w-full flex-col gap-2 sm:flex-row sm:justify-between">
						<Button
							variant="ghost"
							onClick={requestCancel}
							className="w-full sm:w-auto"
							disabled={!isImporting || cancelRequested}
						>
							Cancel import
						</Button>

						<Button
							variant="secondary"
							onClick={() => setProgressDialogOpen(false)}
							className="w-full sm:w-auto"
							disabled={isImporting && !cancelRequested}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

export function MyStudentImportDialog({
	open,
	onOpenChange,
}: MyStudentImportDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex min-w-0 flex-col gap-6 sm:max-w-xl">
				<MyStudentImportContent />
			</DialogContent>
		</Dialog>
	);
}
