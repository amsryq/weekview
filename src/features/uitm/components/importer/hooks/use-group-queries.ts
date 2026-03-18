import { useQuery } from "@tanstack/react-query";
import { UiTMCourseSection } from "../../../course-section";
import { Course } from "../../../models/course";
import { Group } from "../../../models/group";
import { useImporterSelectionStore } from "../utils/shared";

export function useGroupQueries(
	selectedCampus?: ReturnType<
		typeof useImporterSelectionStore.getState
	>["selectedCampus"],
	selectedFaculty?: ReturnType<
		typeof useImporterSelectionStore.getState
	>["selectedFaculty"],
	selectedCourse?: ReturnType<
		typeof useImporterSelectionStore.getState
	>["selectedCourse"],
) {
	const {
		data: courses,
		isLoading: coursesLoading,
		error: coursesError,
	} = useQuery<Course[]>({
		queryKey: ["uitm", "courses", selectedCampus?.code, selectedFaculty?.code],
		queryFn: () => Course.fetch(selectedFaculty ?? selectedCampus!),
		enabled: Boolean(selectedFaculty || selectedCampus),
		staleTime: 5 * 60 * 1000,
	});

	const {
		data: availableGroups,
		isLoading: groupsLoading,
		error: groupsError,
	} = useQuery<Group[], Error, UiTMCourseSection[]>({
		queryKey: ["uitm", "groups", selectedCourse?.code],
		queryFn: () => Group.fetch(selectedCourse!),
		enabled: Boolean(selectedCourse),
		select: (groups) => groups.map((group) => group.toUiTMCourse()),
	});

	return {
		courses,
		coursesLoading,
		coursesError,
		availableGroups,
		groupsLoading,
		groupsError,
	};
}
