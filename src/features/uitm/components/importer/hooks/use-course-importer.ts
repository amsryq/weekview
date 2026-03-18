import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CourseStore } from "~/lib/stores/course-store";
import { UiTMCourseSection } from "../../../course-section";
import { Campus } from "../../../models/campus";
import { Course } from "../../../models/course";
import { Faculty } from "../../../models/faculty";
import { Group } from "../../../models/group";
import { ScheduleInfo } from "../../../utils/parse-schedule";
import {
	CourseImportProgress,
	getProgressCounts,
	ImportFailure,
	ImportResult,
	ImportSuccess,
	markUnfinishedProgressAsError,
	normalizeString,
	ProgressStatus,
	updateProgressStatus,
} from "../utils/shared";

const CANCELLED_MESSAGE = "Import cancelled";

// --- Types & Internal State Hook ---

type ImportPhase = "idle" | "setup" | "importing" | "cancelled" | "complete";

interface ImportState {
	importPhase: ImportPhase;
	setImportPhase: React.Dispatch<React.SetStateAction<ImportPhase>>;
	campusInfo: { campus?: Campus; faculty?: Faculty };
	setCampusInfo: React.Dispatch<
		React.SetStateAction<{ campus?: Campus; faculty?: Faculty }>
	>;
	courseProgress: CourseImportProgress[];
	setCourseProgress: React.Dispatch<
		React.SetStateAction<CourseImportProgress[]>
	>;
	progressDialogOpen: boolean;
	setProgressDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
	cancelRequested: boolean;
	setCancelRequested: React.Dispatch<React.SetStateAction<boolean>>;
	cancelRequestedRef: React.MutableRefObject<boolean>;
}

function useImportState(importerOpen: boolean): ImportState {
	const [importPhase, setImportPhase] = useState<ImportPhase>("idle");
	const [campusInfo, setCampusInfo] = useState<{
		campus?: Campus;
		faculty?: Faculty;
	}>({});
	const [courseProgress, setCourseProgress] = useState<CourseImportProgress[]>(
		[],
	);
	const [progressDialogOpen, setProgressDialogOpen] = useState(false);
	const [cancelRequested, setCancelRequested] = useState(false);
	const cancelRequestedRef = useRef(false);

	useEffect(() => {
		if (!importerOpen) {
			setProgressDialogOpen(false);
			setImportPhase("idle");
			setCampusInfo({});
			setCourseProgress([]);
			cancelRequestedRef.current = false;
			setCancelRequested(false);
		}
	}, [importerOpen]);

	return {
		importPhase,
		setImportPhase,
		campusInfo,
		setCampusInfo,
		courseProgress,
		setCourseProgress,
		progressDialogOpen,
		setProgressDialogOpen,
		cancelRequested,
		setCancelRequested,
		cancelRequestedRef,
	};
}

// --- Import Orchestration Logic ---

function ensureNotCancelled(state: ImportState, applyCancellation: () => void) {
	if (!state.cancelRequestedRef.current) return;
	applyCancellation();
	throw new Error(CANCELLED_MESSAGE);
}

async function fetchInitialMetadata(
	state: ImportState,
	queryClient: ReturnType<typeof useQueryClient>,
	applyCancellation: () => void,
	schedule: ScheduleInfo,
	selectedCampus?: Campus,
	selectedFaculty?: Faculty,
) {
	ensureNotCancelled(state, applyCancellation);

	let campus = selectedCampus;
	if (!campus) {
		const campuses = await queryClient.fetchQuery({
			queryKey: ["uitm", "campuses"],
			queryFn: Campus.fetch,
			staleTime: 5 * 60 * 1000,
		});
		campus = (campuses as Campus[]).find(
			(c) =>
				normalizeString(c.code) ===
					normalizeString(schedule.campus?.code ?? "") ||
				(schedule.campus?.name &&
					normalizeString(c.name) === normalizeString(schedule.campus.name)),
		);
	}

	if (!campus) throw new Error("Unable to determine campus.");
	ensureNotCancelled(state, applyCancellation);

	let faculty = selectedFaculty;
	if (campus.requireFaculty && !faculty) {
		const faculties = await queryClient.fetchQuery({
			queryKey: ["uitm", "faculties", campus.code],
			queryFn: () => Faculty.fetch(campus!),
			staleTime: 5 * 60 * 1000,
		});
		faculty = (faculties as Faculty[]).find(
			(f) =>
				normalizeString(f.code) ===
					normalizeString(schedule.faculty?.code ?? "") ||
				(schedule.faculty?.name &&
					normalizeString(f.name) === normalizeString(schedule.faculty.name)),
		);
	}
	ensureNotCancelled(state, applyCancellation);

	state.setCampusInfo({ campus, faculty });
	return { campus, faculty };
}

async function processImportEntry(
	entry: { courseCode: string; name: string; group: string },
	courseLookup: Map<string, Course>,
	groupsByCourse: Map<string, UiTMCourseSection[] | null>,
	queryClient: ReturnType<typeof useQueryClient>,
	updateCourseStatus: (
		c: string,
		g: string,
		s: ProgressStatus,
		r?: string,
	) => void,
) {
	const course = courseLookup.get(normalizeString(entry.courseCode));
	if (!course) throw new Error("Course not found");

	const cachedGroups = groupsByCourse.get(course.code);
	let uitmGroups = cachedGroups;

	if (uitmGroups === undefined) {
		try {
			const result = await queryClient.fetchQuery({
				queryKey: ["uitm", "groups", course.code],
				queryFn: () => Group.fetch(course),
				staleTime: 5 * 60 * 1000,
			});
			uitmGroups = (result as Group[]).map((g) => g.toUiTMCourse());
			groupsByCourse.set(course.code, uitmGroups);
		} catch (e) {
			groupsByCourse.set(course.code, null);
			throw e;
		}
	}

	if (uitmGroups === null) throw new Error("Group fetch failed earlier.");

	const matchingGroup = uitmGroups.find(
		(g) => normalizeString(g.internal.group) === normalizeString(entry.group),
	);
	if (!matchingGroup) throw new Error("Group not found");

	const store = CourseStore.getState();
	const alreadyExists = store.courses.some(
		(ci) =>
			ci instanceof UiTMCourseSection &&
			normalizeString(ci.internal.code) ===
				normalizeString(matchingGroup.internal.code) &&
			normalizeString(ci.internal.group) ===
				normalizeString(matchingGroup.internal.group),
	);
	if (alreadyExists) throw new Error("Already in timetable");

	const conflicts = store.getConflictingCourses(matchingGroup.meetingTimes);
	if (conflicts.length > 0)
		throw new Error(
			`Conflicts with ${conflicts.map((c) => c.code).join(", ")}`,
		);

	CourseStore.getState().addCourse(matchingGroup);
}

// --- Main Hook ---

export function useCourseImporter(options: {
	selectedCampus?: Campus;
	selectedFaculty?: Faculty;
	onImportSuccess?: (result: ImportResult) => void;
	importerOpen: boolean;
}) {
	const queryClient = useQueryClient();
	const state = useImportState(options.importerOpen);

	const applyCancellation = useCallback(
		(reason = CANCELLED_MESSAGE) => {
			state.setImportPhase((prev) =>
				prev === "cancelled" ? prev : "cancelled",
			);
			state.setCourseProgress((prev) =>
				markUnfinishedProgressAsError(prev, reason),
			);
		},
		[state.setImportPhase, state.setCourseProgress],
	);

	const requestCancel = useCallback(() => {
		if (state.cancelRequestedRef.current) return;
		state.cancelRequestedRef.current = true;
		state.setCancelRequested(true);
		applyCancellation();
	}, [applyCancellation, state.cancelRequestedRef, state.setCancelRequested]);

	const updateCourseStatus = useCallback(
		(c: string, g: string, s: ProgressStatus, r?: string) => {
			state.setCourseProgress((prev) => updateProgressStatus(prev, c, g, s, r));
		},
		[state.setCourseProgress],
	);

	const runImport = async (schedule: ScheduleInfo) => {
		state.setImportPhase("setup");
		const initialProgress = schedule.courses.map((e) => ({
			courseCode: e.courseCode,
			courseName: e.name,
			group: e.group,
			status: "pending" as ProgressStatus,
		}));
		state.setCourseProgress(initialProgress);

		if (!schedule.courses.length) throw new Error("No courses detected.");

		const { campus, faculty } = await fetchInitialMetadata(
			state,
			queryClient,
			() => applyCancellation(),
			schedule,
			options.selectedCampus,
			options.selectedFaculty,
		);

		const courses = await queryClient.fetchQuery({
			queryKey: ["uitm", "courses", campus.code, faculty?.code],
			queryFn: () => Course.fetch(faculty ?? campus!),
			staleTime: 5 * 60 * 1000,
		});

		const courseLookup = new Map<string, Course>(
			(courses as Course[]).map((c) => [normalizeString(c.code), c]),
		);

		state.setImportPhase("importing");
		const groupsByCourse = new Map<string, UiTMCourseSection[] | null>();
		const dedupeKeys = new Set<string>();
		const successes: ImportSuccess[] = [];
		const failures: ImportFailure[] = [];

		for (const entry of schedule.courses) {
			ensureNotCancelled(state, () => applyCancellation());
			const key = `${normalizeString(entry.courseCode)}__${normalizeString(entry.group)}`;
			updateCourseStatus(entry.courseCode, entry.group, "running");

			if (dedupeKeys.has(key)) {
				updateCourseStatus(entry.courseCode, entry.group, "error", "Duplicate");
				failures.push({ ...entry, reason: "Duplicate entry." });
				continue;
			}
			dedupeKeys.add(key);

			try {
				await processImportEntry(
					entry,
					courseLookup,
					groupsByCourse,
					queryClient,
					updateCourseStatus,
				);
				updateCourseStatus(entry.courseCode, entry.group, "success");
				successes.push({ courseCode: entry.courseCode, group: entry.group });
			} catch (e) {
				const message = e instanceof Error ? e.message : "Failed";
				updateCourseStatus(entry.courseCode, entry.group, "error", message);
				failures.push({ ...entry, reason: message });
			}
		}

		state.setImportPhase("complete");
		return { schedule, campus, faculty, successes, failures };
	};

	const importMutation = useMutation<ImportResult, Error, ScheduleInfo>({
		mutationFn: runImport,
		onSuccess: (result) => options.onImportSuccess?.(result),
	});

	const performImport = useCallback(
		async (schedule: ScheduleInfo) => {
			importMutation.reset();
			state.setCourseProgress([]);
			state.setCampusInfo({});
			state.setImportPhase("idle");
			state.cancelRequestedRef.current = false;
			state.setCancelRequested(false);
			state.setProgressDialogOpen(true);
			try {
				await importMutation.mutateAsync(schedule);
			} catch {
				// handled via mutation & progress state
			}
		},
		[importMutation, state],
	);

	const { successCount, errorCount } = useMemo(
		() => getProgressCounts(state.courseProgress),
		[state.courseProgress],
	);

	return {
		importPhase: state.importPhase,
		campusInfo: state.campusInfo,
		courseProgress: state.courseProgress,
		cancelRequested: state.cancelRequested,
		progressDialogOpen: state.progressDialogOpen,
		setProgressDialogOpen: state.setProgressDialogOpen,
		performImport,
		requestCancel,
		isImporting:
			state.importPhase === "setup" || state.importPhase === "importing",
		errorCount,
		progressTitle:
			state.importPhase === "setup"
				? "Setting up import..."
				: state.importPhase === "importing"
					? "Importing courses"
					: state.importPhase === "cancelled"
						? "Import cancelled"
						: state.importPhase === "complete" && errorCount > 0
							? "Import completed with issues"
							: state.importPhase === "complete"
								? "Import complete"
								: "Preparing import",
		progressSubtitle:
			state.importPhase === "setup"
				? "Fetching campus and faculty data..."
				: state.importPhase === "importing"
					? `Processing ${state.courseProgress.length} course(s)...`
					: state.importPhase === "cancelled"
						? "Stopped early at your request"
						: state.importPhase === "complete"
							? `${successCount} imported • ${errorCount} failed`
							: "Ready to import",
		isPending: importMutation.isPending,
		reset: importMutation.reset,
	};
}
