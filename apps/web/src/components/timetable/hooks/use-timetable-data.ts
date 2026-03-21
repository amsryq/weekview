import { useStore } from "zustand";
import { useMounted } from "~/lib/hooks/useMounted";
import type { Course } from "~/lib/models/course";
import { CourseStore } from "~/lib/stores/course-store";

export function useTimetableData(coursesProp?: Course[]) {
	const mounted = useMounted();
	const courses = useStore(
		CourseStore,
		(state) => coursesProp || state.courses,
	);

	return { mounted, courses };
}
