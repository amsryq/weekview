import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Course } from "../models/course";

interface State {
	courses: Set<Course>;
}

interface Actions {
	createCourse: (...params: ConstructorParameters<typeof Course>) => void;
	removeCourse: (courseId: string) => void;
}

const CourseStore = createStore<State & Actions>()(
	immer((set) => ({
		courses: new Set<Course>(),

		createCourse: (...params) => {
			set((state) => state.courses.add(new Course(...params)));
		},

		removeCourse: (courseId) =>
			set((state) => {
				for (const course of state.courses) {
					if (course.id === courseId) {
						state.courses.delete(course);
						break;
					}
				}
			}),
	})),
);

export { CourseStore };
