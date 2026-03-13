import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Course } from "../models/course";
import { MeetingTime } from "../models/meeting-time";
import {
	resolveTimetableStyle,
	resolveTimetableStyleColorByIndex,
} from "../utils/timetable-styles";
import {
	resolveCurrentStyleColorByIndex,
	TimetablePreferencesStore,
} from "./timetable-preferences";

interface State {
	courses: Course[];
}

interface Actions {
	addCourse: (course: Course) => void;
	updateCourse: (courseId: string, data: Course.Schema) => void;
	removeCourse: (courseId: string) => void;
	getConflictingCourses: (meetingTimes: MeetingTime[]) => Course[];
	getCoursesByProvider: (provider: any) => Course[];
	resetAllToStyle: (styleId: string) => void;
}

const CourseStore = createStore<State & Actions>()(
	immer((set, get) => ({
		courses: [],

		addCourse: (course) => {
			set((state) => {
				if (state.getConflictingCourses(course.meetingTimes).length > 0) {
					throw new Error("Course has time conflicts with existing courses.");
				}

				if (
					course.themeColorIndex === null ||
					course.themeColorIndex === undefined
				) {
					const colorIndex = state.courses.length;
					course.themeColorIndex = colorIndex;
					course.cellAppearance.background =
						resolveCurrentStyleColorByIndex(colorIndex);
				}

				if (!course.cellAppearance.fgColor) {
					course.cellAppearance.fgColor = "#ffffff";
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

		getCoursesByProvider: (provider) => {
			return get().courses.filter((course) => course.provider === provider);
		},

		resetAllToStyle: (styleId) =>
			set((state) => {
				const { timetableColorMode } = TimetablePreferencesStore.getState();
				const paletteSize =
					resolveTimetableStyle(styleId).variants[timetableColorMode].gridColors
						.length;

				state.courses.forEach((course, index) => {
					const colorIndex = index % paletteSize;
					course.themeColorIndex = colorIndex;
					course.cellAppearance.background = resolveTimetableStyleColorByIndex(
						styleId,
						colorIndex,
						timetableColorMode,
					);
					course.cellAppearance.fontFamily = undefined;
				});
			}),
	})),
);

export { CourseStore };
