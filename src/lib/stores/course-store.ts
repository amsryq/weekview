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
				cellAppearance: {
					bgColor: "#FF5733",
					fgColor: "#ffffff",
				},
			}),

			new Course({
				code: "CSC159",
				name: "Operating Systems",
				cellAppearance: { bgColor: "#33B5FF", fgColor: "#ffffff" },
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
				cellAppearance: { bgColor: "#C0392B", fgColor: "#ffffff" },
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
				cellAppearance: { bgColor: "#2980B9", fgColor: "#ffffff" },
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
				cellAppearance: { bgColor: "#16A085", fgColor: "#ffffff" },
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
				cellAppearance: { bgColor: "#8E44AD", fgColor: "#ffffff" },
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
				cellAppearance: { bgColor: "#27AE60", fgColor: "#ffffff" },
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
				cellAppearance: { bgColor: "#E67E22", fgColor: "#ffffff" },
				meetingTimes: [
					new MeetingTime({
						day: 3,
						time: new TimeRange(
							Clock.fromString("10:00"),
							Clock.fromString("11:00"),
						),
						cellAppearance: {
							textAlign: "center",
						},
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
				cellAppearance: { bgColor: "#D35400", fgColor: "#ffffff" },
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
				code: "CSC330",
				name: "Parallel Computing",
				cellAppearance: { bgColor: "#34495E", fgColor: "#ffffff" },
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
				cellAppearance: { bgColor: "#BDC3C7", fgColor: "#ffffff" },
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
