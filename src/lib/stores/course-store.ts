import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Course } from "../models/course";
import { MeetingTime } from "../models/meeting-time";

interface State {
	courses: Course[];
}

interface Actions {
	addCourse: (course: Course) => void;
	updateCourse: (courseId: string, data: Course.Schema) => void;
	removeCourse: (courseId: string) => void;
	getConflictingCourses: (meetingTimes: MeetingTime[]) => Course[];
}

const CourseStore = createStore<State & Actions>()(
	immer((set, get) => ({
		courses: [],

		addCourse: (course) => {
			set((state) => {
				if (state.getConflictingCourses(course.meetingTimes).length > 0) {
					throw new Error("Course has time conflicts with existing courses.");
				}

				state.courses.push(course);
			});
		},

		updateCourse: (courseId, data) =>
			set((state) => {
				const courseIndex = state.courses.findIndex((c) => c.id === courseId);
				if (courseIndex === -1) {
					throw new Error("Course not found");
				}

				const updatedCourse = state.courses[courseIndex];
				const conflictingCourses = state
					.getConflictingCourses(
						data.meetingTimes.map(MeetingTime.createFromSchema),
					)
					.filter((c) => c.id !== courseId);

				if (conflictingCourses.length > 0) {
					throw new Error("Course has time conflicts with existing courses.");
				}

				Course.assignFromSchema(updatedCourse, data);
			}),

		removeCourse: (courseId) =>
			set((state) => {
				state.courses = state.courses.filter(
					(course) => course.id !== courseId,
				);
			}),

		getConflictingCourses: (meetingTimes) => {
			return get().courses.filter((course) =>
				course.meetingTimes.some((mt1) =>
					meetingTimes.some((mt2) => mt1.overlaps(mt2)),
				),
			);
		},
	})),
);

export { CourseStore };
