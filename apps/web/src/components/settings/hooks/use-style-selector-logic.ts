import { useMemo } from "react";
import { useStore } from "zustand";
import { useTheme } from "~/lib/contexts/themes";
import {
	TIMETABLE_STYLES,
	type TimetableThemePreference,
} from "~/lib/models/style";
import { CourseStore } from "~/lib/stores/course-store";
import { CustomStylesStore } from "~/lib/stores/custom-styles-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";

export function getDefaultStyleName(baseStyleId: string): string {
	const baseStyle = TIMETABLE_STYLES.find((style) => style.id === baseStyleId);
	return `${baseStyle?.name ?? TIMETABLE_STYLES[0].name} Custom`;
}

export function shouldReplaceAutoStyleName(currentName: string): boolean {
	return currentName.trim().length === 0 || currentName.endsWith(" Custom");
}

export function useStyleSelectorData() {
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(s) => s.activeStyleId,
	);
	const timetableThemePreference = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableThemePreference,
	);
	const timetableColorMode = useStore(
		TimetablePreferencesStore,
		(s) => s.timetableColorMode,
	);
	const customStyles = useStore(CustomStylesStore, (s) => s.styles);

	const styles = useMemo(
		() => [...TIMETABLE_STYLES, ...customStyles],
		[customStyles],
	);
	const customStyleIds = useMemo(
		() => new Set(customStyles.map((style) => style.id)),
		[customStyles],
	);

	return {
		activeStyleId,
		timetableThemePreference,
		timetableColorMode,
		styles,
		customStyleIds,
	};
}

function applyStyle(styleId: string) {
	TimetablePreferencesStore.getState().applyStyle(styleId);
	CourseStore.getState().resetAllToStyle(styleId);
}

export function useStyleSelectorActions() {
	const { applyingTheme } = useTheme();

	const setThemePreference = (preference: TimetableThemePreference) => {
		const store = TimetablePreferencesStore.getState();
		store.setTimetableThemePreference(preference);
		if (preference === "follow-app") {
			store.setAppThemeMode(applyingTheme);
		}
		CourseStore.getState().resetAllToStyle(store.activeStyleId);
	};

	const createStyleFromBuiltIn = (
		baseStyleId: string,
		createStyleName: string,
	) => {
		const createdStyleId = CustomStylesStore.getState().createFromBuiltIn(
			baseStyleId,
			createStyleName,
		);
		applyStyle(createdStyleId);
		return createdStyleId;
	};

	return {
		applyStyle,
		setThemePreference,
		createStyleFromBuiltIn,
	};
}
