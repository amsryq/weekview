import { createStore } from "zustand";
import { UiTMProvider } from "~/features/uitm/provider";
import type { CourseProvider } from "../models/course-provider";
import { ManualCourseProvider } from "../providers/manual-course-provider";

interface State {
	providers: CourseProvider[];
}

const ProviderStore = createStore<State>(() => ({
	providers: [ManualCourseProvider.instance, UiTMProvider.instance],
}));

export { ProviderStore };
