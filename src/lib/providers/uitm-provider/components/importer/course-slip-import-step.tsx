import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pick } from "es-toolkit";
import {
	AlertCircle,
	ArrowLeft,
	CheckIcon,
	Loader2,
	XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
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
import { Textarea } from "~/components/ui/textarea";
import { CourseStore } from "~/lib/stores/course-store";
import { UiTMGroup } from "../../group";
import { Campus } from "../../models/campus";
import { Course } from "../../models/course";
import { Faculty } from "../../models/faculty";
import { Group } from "../../models/group";
import { parseSchedule, ScheduleInfo } from "../../utils/parse-schedule";
import {
	CourseImportProgress,
	ImportFailure,
	ImportResult,
	ImportSuccess,
	normalizeString,
	ProgressStatus,
	useImporterSelectionStore,
} from "./shared";

function CourseSlipImportStep() {
	const queryClient = useQueryClient();
	const { setCurrentStep, setSelectedCampus, setSelectedFaculty } =
		useImporterSelectionStore(
			useShallow((state) =>
				pick(state, [
					"selectedCampus",
					"selectedFaculty",
					"setCurrentStep",
					"setSelectedCampus",
					"setSelectedFaculty",
				]),
			),
		);
	const importerOpen = useImporterSelectionStore((state) => state.open);
	const [rawText, setRawText] = useState("");
	const parsedSchedule = useMemo(() => parseSchedule(rawText), [rawText]);
	const [progressDialogOpen, setProgressDialogOpen] = useState(false);
	const [howToOpen, setHowToOpen] = useState(false);

	const [importPhase, setImportPhase] = useState<
		"idle" | "setup" | "importing" | "complete"
	>("idle");
	const [campusInfo, setCampusInfo] = useState<{
		campus?: Campus;
		faculty?: Faculty;
	}>({});
	const [courseProgress, setCourseProgress] = useState<CourseImportProgress[]>(
		[],
	);

	useEffect(() => {
		if (!importerOpen) {
			setProgressDialogOpen(false);
			setImportPhase("idle");
			setCampusInfo({});
			setCourseProgress([]);
		}
	}, [importerOpen]);

	const importMutation = useMutation<ImportResult, Error, ScheduleInfo>({
		mutationFn: async (schedule) => {
			setImportPhase("setup");

			// Initialize all courses as pending
			const initialProgress: CourseImportProgress[] = schedule.courses.map(
				(entry) => ({
					courseCode: entry.courseCode,
					courseName: entry.name,
					group: entry.group,
					status: "pending" as ProgressStatus,
				}),
			);
			setCourseProgress(initialProgress);

			// Validate courses exist
			if (!schedule.courses.length) {
				const message =
					"No courses detected in the pasted text. Please ensure you're copying the full registration list.";
				setImportPhase("complete");
				throw new Error(message);
			}

			// Fetch and match campus
			const campuses = await queryClient.fetchQuery({
				queryKey: ["uitm", "campuses"],
				queryFn: Campus.fetch,
				staleTime: 5 * 60 * 1000,
			});

			const findCampusMatch = () => {
				if (!schedule.campus) return undefined;
				const code = normalizeString(schedule.campus.code);
				const name = schedule.campus.name
					? normalizeString(schedule.campus.name)
					: undefined;
				return campuses.find(
					(campus) =>
						normalizeString(campus.code) === code ||
						(name && normalizeString(campus.name) === name),
				);
			};

			const campus: Campus | undefined = findCampusMatch();

			if (!campus) {
				const message =
					"Unable to determine campus from the pasted text. Please ensure the campus header is included or select a campus manually first.";
				setImportPhase("complete");
				throw new Error(message);
			}

			// Fetch and match faculty if needed
			let faculty: Faculty | undefined;
			if (campus.requireFaculty) {
				const faculties = await queryClient.fetchQuery({
					queryKey: ["uitm", "faculties", campus.code],
					queryFn: () => Faculty.fetch(campus),
					staleTime: 5 * 60 * 1000,
				});

				const findFacultyMatch = () => {
					if (!schedule.faculty) return undefined;
					const code = normalizeString(schedule.faculty.code);
					const name = schedule.faculty.name
						? normalizeString(schedule.faculty.name)
						: undefined;
					return faculties?.find(
						(facultyItem) =>
							normalizeString(facultyItem.code) === code ||
							(name && normalizeString(facultyItem.name) === name),
					);
				};

				faculty = findFacultyMatch();

				if (faculty) {
					const matchedFromList = faculties?.find(
						(facultyItem) =>
							normalizeString(facultyItem.code) ===
							normalizeString(faculty!.code),
					);
					faculty = matchedFromList ?? faculty;
				}

				if (!faculty) {
					const message =
						"Unable to determine faculty from the pasted text. Please ensure the faculty header is included or select a faculty manually first.";
					setImportPhase("complete");
					throw new Error(message);
				}
			}

			// Update campus/faculty info
			setCampusInfo({ campus, faculty });

			// Fetch all courses
			const courses = await queryClient.fetchQuery({
				queryKey: ["uitm", "courses", campus.code, faculty?.code],
				queryFn: () => Course.fetch(faculty ?? campus),
				staleTime: 5 * 60 * 1000,
			});

			const courseLookup = new Map<string, Course>();
			for (const course of courses) {
				courseLookup.set(normalizeString(course.code), course);
			}

			// Start importing courses
			setImportPhase("importing");
			const groupsByCourse = new Map<string, UiTMGroup[] | null>();
			const dedupeKeys = new Set<string>();
			const successes: ImportSuccess[] = [];
			const failures: ImportFailure[] = [];

			const fetchGroupsForCourse = async (
				course: Course,
			): Promise<UiTMGroup[]> => {
				const cachedGroups = groupsByCourse.get(course.code);
				if (cachedGroups !== undefined) {
					if (cachedGroups === null) {
						throw new Error("Group fetch failed earlier.");
					}
					return cachedGroups;
				}

				try {
					const result = await queryClient.fetchQuery({
						queryKey: ["uitm", "groups", course.code],
						queryFn: () => Group.fetch(course),
						staleTime: 5 * 60 * 1000,
					});
					const groups = result.map((group) => group.toUiTMCourse());
					groupsByCourse.set(course.code, groups);
					return groups;
				} catch (error) {
					groupsByCourse.set(course.code, null);
					throw error;
				}
			};

			const updateCourseStatus = (
				courseCode: string,
				group: string,
				status: ProgressStatus,
				reason?: string,
			) => {
				setCourseProgress((prev) =>
					prev.map((item) =>
						item.courseCode === courseCode && item.group === group
							? { ...item, status, reason }
							: item,
					),
				);
			};

			for (const entry of schedule.courses) {
				const key = `${normalizeString(entry.courseCode)}__${normalizeString(entry.group)}`;

				// Mark as running
				updateCourseStatus(entry.courseCode, entry.group, "running");

				if (dedupeKeys.has(key)) {
					updateCourseStatus(
						entry.courseCode,
						entry.group,
						"error",
						"Duplicate entry",
					);
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: "Duplicate entry in course slip.",
					});
					continue;
				}
				dedupeKeys.add(key);

				const course = courseLookup.get(normalizeString(entry.courseCode));
				if (!course) {
					updateCourseStatus(
						entry.courseCode,
						entry.group,
						"error",
						"Course not found",
					);
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: "Course not found in UiTM catalog.",
					});
					continue;
				}

				let uitmGroups: UiTMGroup[];
				try {
					uitmGroups = await fetchGroupsForCourse(course);
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to fetch groups";
					updateCourseStatus(entry.courseCode, entry.group, "error", message);
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: message,
					});
					continue;
				}

				const matchingGroup = uitmGroups.find(
					(group) =>
						normalizeString(group.internal.group) ===
						normalizeString(entry.group),
				);

				if (!matchingGroup) {
					updateCourseStatus(
						entry.courseCode,
						entry.group,
						"error",
						"Group not found",
					);
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: "Group not found for this course.",
					});
					continue;
				}

				const storeState = CourseStore.getState();
				const alreadyExists = storeState.courses.some(
					(courseItem) =>
						courseItem instanceof UiTMGroup &&
						normalizeString(courseItem.internal.code) ===
							normalizeString(matchingGroup.internal.code) &&
						normalizeString(courseItem.internal.group) ===
							normalizeString(matchingGroup.internal.group),
				);

				if (alreadyExists) {
					updateCourseStatus(
						entry.courseCode,
						entry.group,
						"error",
						"Already in timetable",
					);
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: "This group is already in your timetable.",
					});
					continue;
				}

				const conflicts = storeState.getConflictingCourses(
					matchingGroup.meetingTimes,
				);
				if (conflicts.length > 0) {
					const conflictMsg = `Conflicts with ${conflicts.map((c) => c.code).join(", ")}`;
					updateCourseStatus(
						entry.courseCode,
						entry.group,
						"error",
						conflictMsg,
					);
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: `Time conflict with ${conflicts.map((conflict) => conflict.code).join(", ")}.`,
					});
					continue;
				}

				try {
					CourseStore.getState().addCourse(matchingGroup);
					updateCourseStatus(entry.courseCode, entry.group, "success");
					successes.push({
						courseCode: matchingGroup.internal.code,
						group: matchingGroup.internal.group,
					});
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add course";
					updateCourseStatus(entry.courseCode, entry.group, "error", message);
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: message,
					});
				}
			}

			setImportPhase("complete");
			return {
				schedule,
				campus,
				faculty,
				successes,
				failures,
			};
		},
		onSuccess: (result) => {
			setSelectedCampus(result.campus);
			setSelectedFaculty(result.faculty);
		},
	});

	const handleImport = async () => {
		importMutation.reset();
		setCourseProgress([]);
		setCampusInfo({});
		setImportPhase("idle");

		const schedule = parseSchedule(rawText);
		setProgressDialogOpen(true);

		try {
			await importMutation.mutateAsync(schedule);
		} catch {
			// handled via mutation & progress state
		}
	};

	const suggestedCampus = parsedSchedule.campus?.name
		? `${parsedSchedule.campus.code} – ${parsedSchedule.campus.name}`
		: (parsedSchedule.campus?.code ?? "");
	const suggestedFaculty = parsedSchedule.faculty?.name
		? `${parsedSchedule.faculty.code} – ${parsedSchedule.faculty.name}`
		: (parsedSchedule.faculty?.code ?? "");
	const coursePreview = parsedSchedule.courses.slice(0, 8);
	const remainingCourses = parsedSchedule.courses.length - coursePreview.length;

	const successCount = courseProgress.filter(
		(item) => item.status === "success",
	).length;
	const errorCount = courseProgress.filter(
		(item) => item.status === "error",
	).length;
	const isImporting = importPhase === "setup" || importPhase === "importing";
	const isComplete = importPhase === "complete";

	const progressTitle = isImporting
		? importPhase === "setup"
			? "Setting up import..."
			: "Importing courses"
		: isComplete && errorCount > 0
			? "Import completed with issues"
			: isComplete
				? "Import complete"
				: "Preparing import";
	const progressSubtitle = isImporting
		? importPhase === "setup"
			? "Fetching campus and faculty data..."
			: `Processing ${courseProgress.length} course${courseProgress.length === 1 ? "" : "s"}...`
		: isComplete
			? `${successCount} imported • ${errorCount} failed`
			: "Ready to import";

	return (
		<>
			<DialogHeader>
				<DialogTitle>Import from registration list</DialogTitle>
				<DialogDescription>
					Paste the text from your UiTM registration/course slip. We'll parse it
					and add matching groups to your timetable.
				</DialogDescription>
			</DialogHeader>

			<div className="flex flex-col gap-4">
				<Textarea
					value={rawText}
					onChange={(event) => setRawText(event.target.value)}
					placeholder="Paste your course slip here..."
					className="max-h-48 min-h-24 resize-y"
				/>

				{rawText.trim() !== "" && (
					<div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
						<div className="text-sm font-medium">Detected details</div>
						<div className="grid gap-1 text-sm text-muted-foreground">
							{suggestedCampus ? (
								<div>
									<span className="font-medium text-foreground">Campus:</span>{" "}
									{suggestedCampus}
								</div>
							) : (
								<div className="text-destructive">Campus not detected.</div>
							)}
							{suggestedFaculty ? (
								<div>
									<span className="font-medium text-foreground">Faculty:</span>{" "}
									{suggestedFaculty}
								</div>
							) : (
								<div className="text-destructive">Faculty not detected.</div>
							)}
						</div>
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
				<div className="text-sm text-muted-foreground">
					Only essential details (campus, faculty, course codes, and groups) are
					sent to our server. No personal information from your slip will be
					sent or stored.
				</div>

				{importMutation.error && (
					<Alert variant="destructive">
						<AlertTitle>Import failed</AlertTitle>
						<AlertDescription>{importMutation.error.message}</AlertDescription>
					</Alert>
				)}
			</div>

			<DialogFooter className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex w-full flex-col gap-2 sm:flex-row sm:w-auto">
					<Button
						variant="outline"
						onClick={() => setCurrentStep(0)}
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
					disabled={importMutation.isPending || rawText.trim() === ""}
					className="w-full sm:w-auto"
				>
					{importMutation.isPending && (
						<Loader2 className="mr-2 size-4 animate-spin" />
					)}
					Import courses
				</Button>
			</DialogFooter>

			<Dialog open={howToOpen} onOpenChange={(open) => setHowToOpen(open)}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>Importing your course slip</DialogTitle>
						<DialogDescription className="sr-only">
							A short guide on how to import your UiTM course slip.
						</DialogDescription>
					</DialogHeader>
					<div className="py-2">
						<p className="text-sm text-muted-foreground">
							You can import your course slip by copying your course
							registration details from the{" "}
							<a
								className="underline"
								href="https://ecr.uitm.edu.my/estudent/ecr/main.cfm?status=1"
							>
								UiTM's e-Course Registration System (eCR)
							</a>
							. Here's what to copy:
						</p>

						<img
							src="/images/uitm-course-slip-select.png"
							alt="What to select on the course slip"
						/>
					</div>
					<DialogFooter>
						<Button variant="secondary" onClick={() => setHowToOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

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

					<div className="space-y-4 py-4">
						{/* Campus & Faculty Status */}
						<div className="rounded-lg border bg-muted/30 p-4">
							<h3 className="text-sm font-semibold mb-3">Import Status</h3>
							<div className="space-y-2">
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Campus</span>
									<div className="flex items-center gap-2">
										{campusInfo.campus ? (
											<>
												<span className="font-medium">
													{campusInfo.campus.name}
												</span>
												<CheckIcon className="size-4 text-emerald-500" />
											</>
										) : isImporting ? (
											<Loader2 className="size-4 animate-spin text-muted-foreground" />
										) : (
											<span className="text-muted-foreground">Pending</span>
										)}
									</div>
								</div>
								{(campusInfo.campus?.requireFaculty || campusInfo.faculty) && (
									<div className="flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Faculty</span>
										<div className="flex items-center gap-2">
											{campusInfo.faculty ? (
												<>
													<span className="font-medium">
														{campusInfo.faculty.code} –{" "}
														{campusInfo.faculty.name}
													</span>
													<CheckIcon className="size-4 text-emerald-500" />
												</>
											) : isImporting ? (
												<Loader2 className="size-4 animate-spin text-muted-foreground" />
											) : (
												<span className="text-muted-foreground">Pending</span>
											)}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Courses Progress */}
						{courseProgress.length > 0 && (
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
						)}
					</div>

					<DialogFooter className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
						<Button
							variant="secondary"
							onClick={() => setProgressDialogOpen(false)}
							className="w-full sm:w-auto"
							disabled={isImporting}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

export { CourseSlipImportStep };
