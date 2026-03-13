import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { CourseProvider } from "../models/course-provider";
import { CourseStore } from "../stores/course-store";

export function useProviderCourses(provider: CourseProvider) {
	return useStore(
		CourseStore,
		useShallow((s) => s.courses.filter((c) => c.provider === provider)),
	);
}
