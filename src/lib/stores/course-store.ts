import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Course } from "../models/course";
import { MeetingTime } from "../models/meeting-time";
import { getStyleById, getStyleColorByIndex } from "../models/style";
import { TimetablePreferencesStore } from "./timetable-preferences";

interface State {
	courses: Course[];
}

interface Actions {
	addCourse: (course: Course) => void;
	updateCourse: (courseId: string, data: Course.Schema) => void;
	removeCourse: (courseId: string) => void;
	getConflictingCourses: (meetingTimes: MeetingTime[]) => Course[];
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
					const activeStyleId =
						TimetablePreferencesStore.getState().activeStyleId;
					const colorIndex = state.courses.length;
					course.themeColorIndex = colorIndex;
					course.cellAppearance.background = getStyleColorByIndex(
						activeStyleId,
						colorIndex,
					);
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

		resetAllToStyle: (styleId) =>
			set((state) => {
				const paletteSize = getStyleById(styleId).gridColors.length;

				state.courses.forEach((course, index) => {
					const colorIndex = index % paletteSize;
					course.themeColorIndex = colorIndex;
					course.cellAppearance.background = getStyleColorByIndex(
						styleId,
						colorIndex,
					);
					course.cellAppearance.fontFamily = undefined;
				});
			}),
	})),
);

export { CourseStore };
