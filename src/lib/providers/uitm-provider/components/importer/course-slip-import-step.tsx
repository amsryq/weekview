import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pick } from "es-toolkit";
import { ArrowLeft, CheckIcon, Loader2, XIcon } from "lucide-react";
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
	ImportFailure,
	ImportResult,
	ImportSuccess,
	normalizeString,
	ProgressItem,
	ProgressStatus,
	useImporterSelectionStore,
} from "./shared";

function CourseSlipImportStep() {
	const queryClient = useQueryClient();
	const {
		selectedCampus,
		selectedFaculty,
		setCurrentStep,
		setSelectedCampus,
		setSelectedFaculty,
	} = useImporterSelectionStore(
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
	const [importSummary, setImportSummary] = useState<ImportResult | null>(null);
	const [progressDialogOpen, setProgressDialogOpen] = useState(false);
	const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);

	useEffect(() => {
		if (!importerOpen) {
			setProgressDialogOpen(false);
			setProgressItems([]);
		}
	}, [importerOpen]);

	const importMutation = useMutation<ImportResult, Error, ScheduleInfo>({
		mutationFn: async (schedule) => {
			const startStep = (id: string, label: string) => {
				setProgressItems((prev) => {
					const next = [...prev];
					const index = next.findIndex((item) => item.id === id);
					if (index === -1) {
						next.push({ id, label, status: "running" });
					} else {
						const item = {
							...next[index],
							label,
							status: "running",
						} as ProgressItem;
						if ("detail" in item) delete item.detail;
						next[index] = item;
					}
					return next;
				});
			};

			const finishStep = (
				id: string,
				status: Exclude<ProgressStatus, "running">,
				detail?: string,
			) => {
				setProgressItems((prev) => {
					const next = [...prev];
					const index = next.findIndex((item) => item.id === id);
					if (index === -1) {
						const item: ProgressItem = { id, label: "", status };
						if (detail !== undefined) item.detail = detail;
						next.push(item);
						return next;
					}
					const item: ProgressItem = { ...next[index], status };
					if (detail !== undefined) {
						item.detail = detail;
					} else if ("detail" in item) {
						delete item.detail;
					}
					next[index] = item;
					return next;
				});
			};

			const runStep = async <T,>(
				id: string,
				label: string,
				fn: () => Promise<T>,
				options?: { successDetail?: (result: T) => string | undefined },
			): Promise<T> => {
				startStep(id, label);
				try {
					const result = await fn();
					const detail = options?.successDetail?.(result);
					finishStep(id, "success", detail);
					return result;
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Unknown error";
					finishStep(id, "error", message);
					throw error;
				}
			};

			startStep("validate", "Validate course slip");

			if (!schedule.courses.length) {
				const message =
					"No courses detected in the pasted text. Please ensure you're copying the full registration list.";
				finishStep("validate", "error", message);
				throw new Error(message);
			}

			finishStep(
				"validate",
				"success",
				`${schedule.courses.length} course entr${schedule.courses.length === 1 ? "y" : "ies"} detected`,
			);

			const campuses = await runStep(
				"fetch-campuses",
				"Fetch campuses",
				() =>
					queryClient.fetchQuery({
						queryKey: ["uitm", "campuses"],
						queryFn: Campus.fetch,
						staleTime: 5 * 60 * 1000,
					}),
				{
					successDetail: (items) =>
						`${items.length} campus${items.length === 1 ? "" : "es"}`,
				},
			);

			startStep("match-campus", "Determine campus");

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

			let campus: Campus | undefined = findCampusMatch();
			if (!campus && selectedCampus) {
				const selectedMatch = campuses.find(
					(c) =>
						normalizeString(c.code) === normalizeString(selectedCampus.code),
				);
				campus = selectedMatch ?? selectedCampus;
			}

			if (!campus) {
				const message =
					"Unable to determine campus from the pasted text. Please ensure the campus header is included or select a campus manually first.";
				finishStep("match-campus", "error", message);
				throw new Error(message);
			}

			finishStep("match-campus", "success", `${campus.code} – ${campus.name}`);

			let faculties: Faculty[] | undefined;
			let faculty: Faculty | undefined;

			if (campus.requireFaculty) {
				faculties = await runStep(
					"fetch-faculties",
					`Fetch faculties for ${campus.code}`,
					() =>
						queryClient.fetchQuery({
							queryKey: ["uitm", "faculties", campus.code],
							queryFn: () => Faculty.fetch(campus),
							staleTime: 5 * 60 * 1000,
						}),
					{
						successDetail: (items) =>
							`${items?.length} facult${items?.length === 1 ? "y" : "ies"}`,
					},
				);

				startStep("match-faculty", "Determine faculty");

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

				const selectedFacultyMatchesCampus =
					selectedFaculty &&
					normalizeString(selectedFaculty.campus.code) ===
						normalizeString(campus.code)
						? selectedFaculty
						: undefined;

				faculty = findFacultyMatch() ?? selectedFacultyMatchesCampus;

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
					finishStep("match-faculty", "error", message);
					throw new Error(message);
				}

				finishStep(
					"match-faculty",
					"success",
					`${faculty.code} – ${faculty.name}`,
				);
			}

			const courses = await runStep(
				"fetch-courses",
				`Fetch courses for ${campus.code}${faculty ? `/${faculty.code}` : ""}`,
				() => Course.fetch(faculty ?? campus),
				{
					successDetail: (items) =>
						`${items.length} course${items.length === 1 ? "" : "s"}`,
				},
			);

			const courseLookup = new Map<string, Course>();
			for (const course of courses) {
				courseLookup.set(normalizeString(course.code), course);
			}

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
					const groups = await runStep(
						`fetch-groups:${course.code}`,
						`Fetch groups for ${course.code}`,
						async () => {
							const result = await queryClient.fetchQuery({
								queryKey: ["uitm", "groups", course.code],
								queryFn: () => Group.fetch(course),
								staleTime: 5 * 60 * 1000,
							});
							return result.map((group) => group.toUiTMCourse());
						},
						{
							successDetail: (items) =>
								`${items.length} group${items.length === 1 ? "" : "s"}`,
						},
					);

					groupsByCourse.set(course.code, groups);
					return groups;
				} catch (error) {
					groupsByCourse.set(course.code, null);
					throw error;
				}
			};

			for (const entry of schedule.courses) {
				const key = `${normalizeString(entry.courseCode)}__${normalizeString(entry.group)}`;
				if (dedupeKeys.has(key)) {
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
						error instanceof Error
							? error.message
							: "Failed to fetch groups for this course.";
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
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: `Time conflict with ${conflicts
							.map((conflict) => conflict.code)
							.join(", ")}.`,
					});
					continue;
				}

				try {
					CourseStore.getState().addCourse(matchingGroup);
					successes.push({
						courseCode: matchingGroup.internal.code,
						group: matchingGroup.internal.group,
					});
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to add course.";
					failures.push({
						courseCode: entry.courseCode,
						group: entry.group,
						reason: message,
					});
				}
			}

			return {
				schedule,
				campus,
				faculty,
				successes,
				failures,
			};
		},
		onSuccess: (result) => {
			setImportSummary(result);
			setSelectedCampus(result.campus);
			setSelectedFaculty(result.faculty);
		},
	});

	const handleImport = async () => {
		setImportSummary(null);
		importMutation.reset();

		const schedule = parseSchedule(rawText);
		setProgressItems([
			{
				id: "validate",
				label: "Validate course slip",
				status: "running",
			},
		]);
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

	const progressHasError = progressItems.some(
		(item) => item.status === "error",
	);
	const progressTitle = importMutation.isPending
		? "Importing timetable"
		: progressHasError
			? "Import finished with issues"
			: "Import complete";
	const progressSubtitle = importMutation.isPending
		? "Hang tight while we fetch data from UiTM."
		: progressHasError
			? "Some steps failed. Review the details below."
			: "All steps completed successfully.";

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
					className="max-h-[180px] resize-y"
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
								<div className="text-destructive">
									Campus not detected — we'll use your current selection.
								</div>
							)}
							{suggestedFaculty ? (
								<div>
									<span className="font-medium text-foreground">Faculty:</span>{" "}
									{suggestedFaculty}
								</div>
							) : (
								selectedCampus?.requireFaculty && (
									<div className="text-destructive">
										Faculty not detected — we'll use your current selection.
									</div>
								)
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

				{importMutation.error && (
					<Alert variant="destructive">
						<AlertTitle>Import failed</AlertTitle>
						<AlertDescription>{importMutation.error.message}</AlertDescription>
					</Alert>
				)}

				{importSummary && (
					<div className="rounded-lg border border-border bg-background p-4 space-y-3">
						<div className="text-sm font-medium text-foreground">
							Import summary
						</div>
						<div className="grid gap-2 text-sm">
							<div className="text-foreground">
								Imported {importSummary.successes.length} group
								{importSummary.successes.length === 1 ? "" : "s"}.
							</div>
							{importSummary.failures.length > 0 && (
								<div className="text-muted-foreground">
									{importSummary.failures.length} entr
									{importSummary.failures.length === 1 ? "y" : "ies"} could not
									be imported:
									<ul className="mt-1 space-y-1 list-disc list-inside">
										{importSummary.failures.map((failure, idx) => (
											<li key={`${failure.courseCode}-${failure.group}-${idx}`}>
												<span className="font-medium text-foreground">
													{failure.courseCode} ({failure.group})
												</span>
												{": "}
												{failure.reason}
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					</div>
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
					{importSummary?.successes.length ? (
						<Button
							variant="secondary"
							onClick={() => setCurrentStep(1)}
							className="w-full sm:w-auto"
						>
							Review imported groups
						</Button>
					) : null}
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

			<Dialog
				open={progressDialogOpen}
				onOpenChange={(open) => {
					if (!importMutation.isPending) {
						setProgressDialogOpen(open);
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							{importMutation.isPending ? (
								<Loader2 className="size-4 animate-spin text-muted-foreground" />
							) : progressHasError ? (
								<XIcon className="size-4 text-destructive" />
							) : (
								<CheckIcon className="size-4 text-emerald-500" />
							)}
							<span>{progressTitle}</span>
						</DialogTitle>
						<DialogDescription>{progressSubtitle}</DialogDescription>
					</DialogHeader>

					<div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto py-2">
						{progressItems.map((item) => (
							<div
								key={item.id}
								className="flex items-start gap-3 rounded-md border border-border/60 bg-background/80 p-3"
							>
								<div className="mt-0.5">
									{item.status === "running" ? (
										<Loader2 className="size-4 animate-spin text-muted-foreground" />
									) : item.status === "success" ? (
										<CheckIcon className="size-4 text-emerald-500" />
									) : (
										<XIcon className="size-4 text-destructive" />
									)}
								</div>
								<div className="min-w-0 space-y-1">
									<div className="text-sm font-medium text-foreground">
										{item.label}
									</div>
									{item.detail && (
										<div
											className={`text-xs ${item.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
										>
											{item.detail}
										</div>
									)}
								</div>
							</div>
						))}
					</div>

					<DialogFooter className="mt-4 flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
						<Button
							variant="secondary"
							onClick={() => setProgressDialogOpen(false)}
							className="w-full sm:w-auto"
							disabled={importMutation.isPending}
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
