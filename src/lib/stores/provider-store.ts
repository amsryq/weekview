import { createStore } from "zustand";
import type { CourseProvider } from "../models/course-provider";
import { ManualCourseProvider } from "../providers/manual-course-provider";
import { TechnoUniversityProvider } from "../providers/techno-university-provider";

interface State {
	providers: CourseProvider[];
}

const ProviderStore = createStore<State>(() => ({
	providers: [ManualCourseProvider.instance, TechnoUniversityProvider.instance],
}));

export { ProviderStore };
