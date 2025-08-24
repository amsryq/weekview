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
	hasTimeConflicts: (course: Course, exempt?: Course) => boolean;
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

		hasTimeConflicts: (course, exempt) => {
			return get().courses.some((existingCourse) => {
				return (
					existingCourse.id !== exempt?.id &&
					existingCourse.hasTimeConflictWith(course)
				);
			});
		},
	})),
);

// TODO: Get rid of this
if (process.env.NODE_ENV !== "production") {
	// setTimeout needed due to circular dependency
	setTimeout(() => {
		[
			new Course({
				code: "CSC186",
				name: "Object Oriented Programming",
				color: "#FF5733",
				meetingTimes: [
					new MeetingTime({
						day: 1,
						location: "Lecture Room 1",
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

			new Course({
				code: "CSC159",
				name: "Operating Systems",
				color: "#33B5FF",
				meetingTimes: [
					new MeetingTime({
						day: 3,
						time: new TimeRange(
							Clock.fromString("13:00"),
							Clock.fromString("15:00"),
						),
					}),
					new MeetingTime({
						day: 5,
						time: new TimeRange(
							Clock.fromString("11:00"),
							Clock.fromString("13:00"),
						),
					}),
				],
			}),

			new Course({
				code: "CSC210",
				name: "Data Structures and Algorithms",
				color: "#C0392B",
				meetingTimes: [
					new MeetingTime({
						day: 1,
						time: new TimeRange(
							Clock.fromString("11:00"),
							Clock.fromString("13:00"),
						),
					}),
					new MeetingTime({
						day: 4,
						time: new TimeRange(
							Clock.fromString("15:00"),
							Clock.fromString("17:00"),
						),
					}),
				],
			}),

			new Course({
				code: "CSC240",
				name: "Computer Networks",
				color: "#2980B9",
				meetingTimes: [
					new MeetingTime({
						day: 2,
						time: new TimeRange(
							Clock.fromString("14:00"),
							Clock.fromString("16:00"),
						),
					}),
					new MeetingTime({
						day: 5,
						time: new TimeRange(
							Clock.fromString("16:00"),
							Clock.fromString("18:00"),
						),
					}),
				],
			}),

			new Course({
				code: "CSC250",
				name: "Software Engineering",
				color: "#16A085",
				meetingTimes: [
					new MeetingTime({
						day: 1,
						time: new TimeRange(
							Clock.fromString("18:00"),
							Clock.fromString("20:00"),
						),
					}),
					new MeetingTime({
						day: 3,
						time: new TimeRange(
							Clock.fromString("20:00"),
							Clock.fromString("22:00"),
						),
					}),
				],
			}),

			new Course({
				code: "MAT215",
				name: "Discrete Mathematics",
				color: "#8E44AD",
				meetingTimes: [
					new MeetingTime({
						day: 1,
						time: new TimeRange(
							Clock.fromString("14:00"),
							Clock.fromString("16:00"),
						),
					}),
					new MeetingTime({
						day: 4,
						time: new TimeRange(
							Clock.fromString("10:00"),
							Clock.fromString("12:00"),
						),
					}),
				],
			}),

			new Course({
				code: "ENG102",
				name: "Academic Writing",
				color: "#27AE60",
				meetingTimes: [
					new MeetingTime({
						day: 2,
						time: new TimeRange(
							Clock.fromString("08:00"),
							Clock.fromString("10:00"),
						),
					}),
				],
			}),

			new Course({
				code: "PHY111",
				name: "Physics I",
				color: "#E67E22",
				meetingTimes: [
					new MeetingTime({
						day: 3,
						time: new TimeRange(
							Clock.fromString("10:00"),
							Clock.fromString("11:00"),
						),
					}),
					new MeetingTime({
						day: 5,
						time: new TimeRange(
							Clock.fromString("14:00"),
							Clock.fromString("16:00"),
						),
					}),
				],
			}),

			new Course({
				code: "PHY111-LAB",
				name: "Physics I Lab",
				color: "#D35400",
				meetingTimes: [
					new MeetingTime({
						day: 4,
						time: new TimeRange(
							Clock.fromString("18:00"),
							Clock.fromString("21:00"),
						),
					}),
				],
			}),

			new Course({
				code: "CSC310",
				name: "Artificial Intelligence",
				color: "#9B59B6",
				meetingTimes: [
					new MeetingTime({
						day: 6,
						time: new TimeRange(
							Clock.fromString("10:00"),
							Clock.fromString("13:00"),
						),
					}),
				],
			}),

			new Course({
				code: "CSC330",
				name: "Parallel Computing",
				color: "#34495E",
				meetingTimes: [
					new MeetingTime({
						day: 2,
						time: new TimeRange(
							Clock.fromString("19:00"),
							Clock.fromString("21:00"),
						),
					}),
					new MeetingTime({
						day: 5,
						time: new TimeRange(
							Clock.fromString("20:00"),
							Clock.fromString("22:00"),
						),
					}),
				],
			}),

			new Course({
				code: "HIS201",
				name: "World History",
				color: "#BDC3C7",
				meetingTimes: [
					new MeetingTime({
						day: 3,
						time: new TimeRange(
							Clock.fromString("08:00"),
							Clock.fromString("10:00"),
						),
					}),
				],
			}),
		].forEach((c) => {
			CourseStore.getState().addCourse(c);
		});
	}, 0);
}

export { CourseStore };
