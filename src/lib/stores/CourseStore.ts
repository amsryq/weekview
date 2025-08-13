import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { Course } from "../models/Course";

interface CourseStore {
	courses: Course[];

	addCourse: (course: Course) => void;
}

const CourseStore = createStore<CourseStore>()(
	immer((set) => ({
		courses: [],
		addCourse: (course) => {
			set((state) => {
				state.courses.push(course);
			});
		},
	})),
);

export { CourseStore };
