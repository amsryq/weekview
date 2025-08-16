import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Clock } from "../models/clock";
import { Course } from "../models/course";
import { MeetingTime } from "../models/meeting-time";
import { TimeRange } from "../models/time-range";

interface State {
	courses: Course[];
}

interface Actions {
	addCourse: (course: Course) => void;
	removeCourse: (courseId: string) => void;
	hasTimeConflicts: (course: Course) => boolean;
}

const CourseStore = createStore<State & Actions>()(
	immer((set, get) => ({
		courses: [],

		addCourse: (course) => {
			set((state) => {
				state.courses.push(course);
			});
		},

		removeCourse: (courseId) =>
			set((state) => {
				state.courses = state.courses.filter(
					(course) => course.id !== courseId,
				);
			}),

		hasTimeConflicts: (course: Course) => {
			return get().courses.some((existingCourse) => {
				return existingCourse.hasTimeConflictWith(course);
			});
		},
	})),
);

// TODO: Get rid of this
if (__DEV__) {
	CourseStore.getState().addCourse(
		new Course({
			code: "CSC186",
			name: "Object Oriented Programming",
			color: "#FF5733",
			meetingTimes: [
				new MeetingTime({
					day: 1,
					time: new TimeRange(
						Clock.fromString("09:00"),
						Clock.fromString("11:00"),
					),
				}),
				new MeetingTime({
					day: 2,
					time: new TimeRange(
						Clock.fromString("10:00"),
						Clock.fromString("12:00"),
					),
				}),
			],
		}),
	);
}

export { CourseStore };
