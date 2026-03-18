import { useDeferredValue, useMemo } from "react";
import { CourseStore } from "~/lib/stores/course-store";
import { UiTMCourseSection } from "../../../course-section";
import { summarizeMeetingTimes } from "../utils/shared";

interface UseGroupFilteringProps {
	availableGroups: UiTMCourseSection[] | undefined;
	selectedGroups: UiTMCourseSection[];
	searchQuery: string;
}

interface UseGroupFilteringResult {
	filteredGroups: UiTMCourseSection[];
	groupSummaries: Map<string, string>;
	selectedGroupKeys: Set<string>;
	groupConflicts: Map<string, string[]>;
	handleGroupSelect: (uitmCourse: UiTMCourseSection) => void;
	handleGroupRemove: (courseCode: string, groupCode: string) => void;
}

export function useGroupFiltering({
	availableGroups,
	selectedGroups,
	searchQuery,
}: UseGroupFilteringProps): UseGroupFilteringResult {
	const deferredSearchQuery = useDeferredValue(searchQuery);

	const groupSummaries = useMemo(() => {
		if (!availableGroups) return new Map<string, string>();
		const map = new Map<string, string>();
		for (const group of availableGroups) {
			const key = `${group.internal.code}-${group.internal.group}`;
			map.set(key, summarizeMeetingTimes(group.meetingTimes));
		}
		return map;
	}, [availableGroups]);

	const selectedGroupKeys = useMemo(() => {
		const set = new Set<string>();
		for (const group of selectedGroups) {
			set.add(`${group.internal.code}-${group.internal.group}`);
		}
		return set;
	}, [selectedGroups]);

	const groupConflicts = useMemo(() => {
		if (!availableGroups) return new Map<string, string[]>();
		const map = new Map<string, string[]>();
		const store = CourseStore.getState();
		for (const group of availableGroups) {
			const key = `${group.internal.code}-${group.internal.group}`;
			const conflicts = store.getConflictingCourses(group.meetingTimes);
			if (conflicts.length > 0) {
				map.set(
					key,
					conflicts.map((c) => c.code),
				);
			}
		}
		return map;
	}, [availableGroups]);

	const filteredGroups = useMemo(() => {
		if (!availableGroups) return [];
		if (!deferredSearchQuery.trim()) return availableGroups;
		const query = deferredSearchQuery.toLowerCase();
		return availableGroups.filter((group) => {
			const groupName = group.internal.group.toLowerCase();
			const key = `${group.internal.code}-${group.internal.group}`;
			const meetingSummary = (groupSummaries.get(key) ?? "").toLowerCase();
			return groupName.includes(query) || meetingSummary.includes(query);
		});
	}, [availableGroups, deferredSearchQuery, groupSummaries]);

	const handleGroupSelect = (uitmCourse: UiTMCourseSection) => {
		const { internal } = uitmCourse;
		const key = `${internal.code}-${internal.group}`;
		if (selectedGroupKeys.has(key)) return;
		if (groupConflicts.has(key)) return;
		CourseStore.getState().addCourse(uitmCourse);
	};

	const handleGroupRemove = (courseCode: string, groupCode: string) => {
		const id = selectedGroups.find(
			(group) =>
				group.internal.code === courseCode &&
				group.internal.group === groupCode,
		)?.id;
		if (!id) return;
		CourseStore.getState().removeCourse(id);
	};

	return {
		filteredGroups,
		groupSummaries,
		selectedGroupKeys,
		groupConflicts,
		handleGroupSelect,
		handleGroupRemove,
	};
}
