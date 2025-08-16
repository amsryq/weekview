import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Clock } from "../models/clock";
import { Course } from "../models/course";
import { MeetingTime } from "../models/meeting-time";
import { TimeRange } from "../models/time-range";

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

// TODO: Get rid of this
if (__DEV__) {
	CourseStore.setState((state) => {
		state.courses = new Set<Course>([
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
		]);
	});
}

export { CourseStore };
