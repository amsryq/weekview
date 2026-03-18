import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { CourseStore } from "~/lib/stores/course-store";
import { UiTMCourseSection } from "../../../course-section";
import { fetchMyStudentTimetable } from "../../../models/mystudent";
import {
	CourseImportProgress,
	ImportFailure,
	ImportSuccess,
	markUnfinishedProgressAsError,
	normalizeString,
	ProgressStatus,
	updateProgressStatus,
} from "../utils/shared";

type ImportPhase = "idle" | "fetching" | "importing" | "cancelled" | "complete";

export const CANCELLED_MESSAGE = "Import cancelled";

interface UseMyStudentImporterResult {
	courseProgress: CourseImportProgress[];
	importPhase: ImportPhase;
	isPending: boolean;
	cancelRequested: boolean;
	importError: Error | null;
	handleImport: (params: {
		studentId: string;
		includeCourseName: boolean;
	}) => Promise<void>;
	requestCancel: () => void;
}

export function useMyStudentImporter(): UseMyStudentImporterResult {
	const [importPhase, setImportPhase] = useState<ImportPhase>("idle");
	const [courseProgress, setCourseProgress] = useState<CourseImportProgress[]>(
		[],
	);
	const [cancelRequested, setCancelRequested] = useState(false);
	const cancelRequestedRef = useRef(false);

	const applyCancellation = (reason = CANCELLED_MESSAGE) => {
		setImportPhase((prev) => (prev === "cancelled" ? prev : "cancelled"));
		setCourseProgress((prev) => markUnfinishedProgressAsError(prev, reason));
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
					updateProgressStatus(prev, courseCode, groupCode, status, reason),
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
						courseItem instanceof UiTMCourseSection &&
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

	const resetImportState = () => {
		importMutation.reset();
		setCourseProgress([]);
		setImportPhase("idle");
		cancelRequestedRef.current = false;
		setCancelRequested(false);
	};

	const handleImport = async ({
		studentId,
		includeCourseName,
	}: {
		studentId: string;
		includeCourseName: boolean;
	}) => {
		resetImportState();
		try {
			await importMutation.mutateAsync({
				id: studentId,
				includeName: includeCourseName,
			});
		} catch {
			// errors handled via mutation state and progress tracking
		}
	};

	return {
		courseProgress,
		importPhase,
		isPending: importMutation.isPending,
		cancelRequested,
		importError: importMutation.error,
		handleImport,
		requestCancel,
	};
}
