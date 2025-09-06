import { toMerged } from "es-toolkit";
import { RequiredDeep, UnknownRecord } from "type-fest";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
	type CellAppearance,
	type CellElements,
	type FontWeight,
} from "../models/cell-appearance";
import { ColorEntry } from "../models/color-entry";
import { Course } from "../models/course";
import { MeetingTime } from "../models/meeting-time";

export type TimetableLayout = "rows" | "columns";

const defaultState = {
	layout: "rows" as TimetableLayout,

	cellAppearance: {
		textAlign: "left",

		visibility: {
			time: true,
			location: true,
			code: true,
			name: true,
		},

		fontSize: {
			code: 22,
			name: 12,
			time: 11,
			location: 11,
		},

		weight: {
			code: "bold",
			name: "normal",
			time: "normal",
			location: "normal",
		},

		// Below this line should always be defined by the course/meeting. These only serves as fallback

		icon: {
			type: "emoji",
			svg: "",
			emoji: "",
			opacity: 0.7,
			rotation: 15,
			offsetX: 4,
			offsetY: 10,
			size: 3,
		},

		background: {
			type: "solid",
			color: "#22223b",
			predefined: false,
		} satisfies ColorEntry.Schema,

		fgColor: "#00FF00",
	} satisfies RequiredDeep<CellAppearance> as RequiredDeep<CellAppearance>,
};

export type State = typeof defaultState;

interface Actions {
	getCellAppearance: (
		course: Course,
		meetingTime: MeetingTime,
	) => RequiredDeep<CellAppearance>;

	setValue: <K extends keyof State>(key: K, value: State[K]) => void;

	setCellAppearanceValue: <K extends keyof CellAppearance>(
		key: K,
		value: CellAppearance[K],
	) => void;

	setCellElementAppearanceValue: (
		key: "visibility" | "fontSize" | "weight",
		subKey: CellElements,
		value: boolean | number | FontWeight,
	) => void;

	setBackgroundAppearance: (background: ColorEntry.Schema) => void;

	reset: () => void;
}

export const TimetablePreferencesStore = createStore<State & Actions>()(
	persist(
		immer((set, get) => ({
			...defaultState,

			getCellAppearance(course: Course, meetingTime: MeetingTime) {
				let appearance: RequiredDeep<CellAppearance> = get().cellAppearance;
				if (course.cellAppearance) {
					appearance = toMerged(appearance, course.cellAppearance);
				}
				if (meetingTime.cellAppearance) {
					appearance = toMerged(appearance, meetingTime.cellAppearance);
				}

				return appearance;
			},

			setValue: (key, value) =>
				set((s) => {
					(s[key] as unknown) = value;
				}),

			setCellElementAppearanceValue: (key, subKey, value) =>
				set((s) => {
					const target = (s.cellAppearance as UnknownRecord)[
						key
					] as UnknownRecord;
					target[subKey] = value as unknown;
				}),

			setCellAppearanceValue: (key, value) =>
				set((s) => {
					(s.cellAppearance as UnknownRecord)[key] = value as unknown;
				}),

			setBackgroundAppearance: (background) =>
				set((s) => {
					s.cellAppearance.background = {
						...background,
						predefined: background.predefined ?? false,
					};
				}),
			reset: () => set(() => defaultState),
		})),
		{
			name: "taiki-timetable-preferences",
		},
	),
);

export type TimetablePreferences = State;
