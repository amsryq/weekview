import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { CourseStore } from "../stores/course-store";
import type { CourseProvider } from "../models/course-provider";

export function useProviderCourses(provider: CourseProvider) {
	return useStore(
		CourseStore,
		useShallow((s) => s.courses.filter((c) => c.provider === provider)),
	);
}
