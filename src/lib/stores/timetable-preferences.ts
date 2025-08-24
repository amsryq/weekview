import { UnknownRecord } from "type-fest";
import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type TimetableLayout = "rows" | "columns";
export type TextAlign = "left" | "center" | "right";
export type FontWeight = "light" | "normal" | "bold";
export type CustomizableElements =
	| "time"
	| "location"
	| "code"
	| "courseName"
	| "lecturer";

const defaultState = {
	layout: "rows" as TimetableLayout,

	visibility: {
		time: true,
		location: true,
		code: true,
		courseName: true,
		lecturer: true,
	} as Record<CustomizableElements, boolean>,

	fontSize: {
		code: 18,
		courseName: 12,
		time: 11,
		location: 11,
		lecturer: 11,
	} as Record<CustomizableElements, number>,

	weight: {
		code: "bold" as FontWeight,
		courseName: "normal" as FontWeight,
		time: "normal" as FontWeight,
		location: "normal" as FontWeight,
		lecturer: "normal" as FontWeight,
	} as Record<CustomizableElements, FontWeight>,

	textAlign: "left" as TextAlign,
};

export type State = typeof defaultState;

interface Actions {
	isVisible: (key: CustomizableElements) => boolean;
	setPreference: <K1 extends keyof State, K2 extends keyof State[K1]>(
		key: K1,
		subKey: K2,
		value: State[K1][K2],
	) => void;
	setValue: <K extends keyof State>(key: K, value: State[K]) => void;
	reset: () => void;
}

export const TimetablePreferencesStore = createStore<State & Actions>()(
	persist(
		immer((set, get) => ({
			...defaultState,

			isVisible: (key) => {
				return get().visibility[key];
			},

			setPreference: (key, subKey, value) =>
				set((s) => {
					(s[key] as UnknownRecord)[subKey] = value;
				}),

			setValue: (key, value) =>
				set((s) => {
					(s[key] as unknown) = value;
				}),

			reset: () => set(() => defaultState),
		})),
		{ name: "taiki-timetable-preferences" },
	),
);

export type TimetablePreferences = State;
