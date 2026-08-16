import { toMerged } from "es-toolkit";
import type { RequiredDeep } from "type-fest";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import {
	type CellAppearance,
	type CellElements,
	DEFAULT_BLUR_OPTIONS,
	DEFAULT_GLASS_OPTIONS,
	type FontWeight,
} from "../models/cell-appearance";
import { ColorEntry } from "../models/color-entry";
import { Course } from "../models/course";
import { MeetingTime } from "../models/meeting-time";
import {
	DEFAULT_TIMETABLE_STYLE_ID,
	type TimetableColorMode,
	type TimetableThemePreference,
} from "../models/style";
import { isBoolean, isNumber, isString } from "../utils/predicates";
import {
	resolveTimetableStyle,
	resolveTimetableStyleColorByIndex,
} from "../utils/timetable-styles";

export type TimetableLayout = "rows" | "columns";

export interface TimetablePreferencesState {
	layout: TimetableLayout;
	activeStyleId: string;
	timetableThemePreference: TimetableThemePreference;
	timetableColorMode: TimetableColorMode;
	backgroundImage: string | null;
	backgroundImageOptions: {
		opacity: number;
	};
	title: string;
	showWatermark: boolean;
	cellAppearance: RequiredDeep<CellAppearance>;
}

const defaultState: TimetablePreferencesState = {
	layout: "rows",
	activeStyleId: DEFAULT_TIMETABLE_STYLE_ID,
	timetableThemePreference: "follow-app",
	timetableColorMode: "light",
	backgroundImage: null,
	backgroundImageOptions: {
		opacity: 0.3,
	},
	title: "",
	showWatermark: true,

	cellAppearance: {
		textAlign: "left",
		material: "basic",
		glassOptions: DEFAULT_GLASS_OPTIONS,
		blurOptions: DEFAULT_BLUR_OPTIONS,
		borderRadius: 8,
		autoSizeFont: true,

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
		fontFamily: resolveTimetableStyle(DEFAULT_TIMETABLE_STYLE_ID).fontFamily,
	},
};

export type State = TimetablePreferencesState;

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

	setBackgroundImage: (imageUrl: string | null) => void;

	setBackgroundImageOptions: (
		options: Partial<State["backgroundImageOptions"]>,
	) => void;

	setTimetableThemePreference: (preference: TimetableThemePreference) => void;

	setAppThemeMode: (themeMode: TimetableColorMode) => void;

	applyStyle: (styleId: string) => void;

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

				if (
					course.themeColorIndex !== null &&
					course.themeColorIndex !== undefined
				) {
					appearance = toMerged(appearance, {
						background: resolveTimetableStyleColorByIndex(
							get().activeStyleId,
							course.themeColorIndex,
							get().timetableColorMode,
						),
					});
				}

				if (meetingTime.cellAppearance) {
					appearance = toMerged(appearance, meetingTime.cellAppearance);
				}

				return appearance;
			},

			setValue: (key, value) =>
				set((s) => {
					// SAFETY: Type-safe key-value assignment constrained by generic parameters
					(s[key] as State[typeof key]) = value;
				}),

			setCellElementAppearanceValue: (key, subKey, value) =>
				set((s) => {
					if (key === "visibility" && isBoolean(value)) {
						s.cellAppearance.visibility[subKey] = value;
					} else if (key === "fontSize" && isNumber(value)) {
						s.cellAppearance.fontSize[subKey] = value;
					} else if (key === "weight" && isString(value)) {
						// SAFETY: Value is validated FontWeight string
						s.cellAppearance.weight[subKey] = value as FontWeight;
					}
				}),

			setCellAppearanceValue: (key, value) =>
				set((s) => {
					// SAFETY: Type-safe key-value assignment for CellAppearance schema
					(s.cellAppearance[key] as CellAppearance[typeof key]) = value;
				}),

			setBackgroundAppearance: (background) =>
				set((s) => {
					s.cellAppearance.background = {
						...background,
						predefined: background.predefined ?? false,
					};
				}),

			setBackgroundImage: (imageUrl) =>
				set((s) => {
					s.backgroundImage = imageUrl;
				}),

			setBackgroundImageOptions: (options) =>
				set((s) => {
					s.backgroundImageOptions = {
						...s.backgroundImageOptions,
						...options,
					};
				}),

			setTimetableThemePreference: (preference) =>
				set((s) => {
					s.timetableThemePreference = preference;
					if (preference !== "follow-app") {
						s.timetableColorMode = preference;
					}
				}),

			setAppThemeMode: (themeMode) =>
				set((s) => {
					if (s.timetableThemePreference === "follow-app") {
						s.timetableColorMode = themeMode;
					}
				}),

			applyStyle: (styleId) =>
				set((s) => {
					const style = resolveTimetableStyle(styleId);
					s.activeStyleId = style.id;
					s.backgroundImage = null;
					s.backgroundImageOptions = {
						opacity: 0.3,
					};
					s.cellAppearance.fontFamily = style.fontFamily;
				}),

			reset: () => set(() => defaultState),
		})),
		{
			name: "taiki-timetable-preferences",
		},
	),
);

export function resolveCurrentStyleColorByIndex(index: number) {
	const { activeStyleId, timetableColorMode } =
		TimetablePreferencesStore.getState();
	return resolveTimetableStyleColorByIndex(
		activeStyleId,
		index,
		timetableColorMode,
	);
}

export type TimetablePreferences = State;
