import { useStore } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";

export function useTimetablePreferences() {
	return useStore(
		TimetablePreferencesStore,
		useShallow((s) => ({
			prefsLayout: s.layout,
			backgroundImage: s.backgroundImage,
			activeStyleId: s.activeStyleId,
			timetableColorMode: s.timetableColorMode,
			globalFontFamily: s.cellAppearance.fontFamily,
			backgroundImageOptions: s.backgroundImageOptions,
		})),
	);
}
