import { createStore } from "zustand";
import type { CourseProvider } from "../models/course-provider";
import { ManualCourseProvider } from "../providers/manual-course-provider";
import { UiTMProvider } from "../providers/uitm-provider";

interface State {
	providers: CourseProvider[];
}

const ProviderStore = createStore<State>(() => ({
	providers: [ManualCourseProvider.instance, UiTMProvider.instance],
}));

export { ProviderStore };
