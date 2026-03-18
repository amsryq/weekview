import { useCallback, useMemo } from "react";
import { useStore } from "zustand";
import { useTheme } from "~/lib/contexts/themes";
import { DEFAULT_TIMETABLE_STYLE_ID } from "~/lib/models/style";
import { CourseStore } from "~/lib/stores/course-store";
import { CustomStylesStore } from "~/lib/stores/custom-styles-store";
import { TimetablePreferencesStore } from "~/lib/stores/timetable-preferences";
import { PREDEFINED_FONTS } from "~/lib/utils/fonts";
import { getCustomStyle } from "../utils/style-utils";

interface UseStyleEditorProps {
	styleId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export const useStyleEditor = ({
	styleId,
	open,
	onOpenChange,
}: UseStyleEditorProps) => {
	const styleExists = useStore(
		CustomStylesStore,
		useCallback((state) => getCustomStyle(state, styleId) !== null, [styleId]),
	);
	const styleName = useStore(
		CustomStylesStore,
		useCallback(
			(state) => getCustomStyle(state, styleId)?.name ?? "",
			[styleId],
		),
	);
	const styleFontFamily = useStore(
		CustomStylesStore,
		useCallback(
			(state) =>
				getCustomStyle(state, styleId)?.fontFamily ?? PREDEFINED_FONTS[0],
			[styleId],
		),
	);
	const activeStyleId = useStore(
		TimetablePreferencesStore,
		(state) => state.activeStyleId,
	);
	const currentTheme = useTheme().applyingTheme;

	const isOpen = useMemo(
		() => open && !!styleId && styleExists,
		[open, styleId, styleExists],
	);

	const handleDelete = useCallback(() => {
		if (!styleId) return;
		if (activeStyleId === styleId) {
			TimetablePreferencesStore.getState().applyStyle(
				DEFAULT_TIMETABLE_STYLE_ID,
			);
			CourseStore.getState().resetAllToStyle(DEFAULT_TIMETABLE_STYLE_ID);
		}
		CustomStylesStore.getState().deleteStyle(styleId);
		onOpenChange(false);
	}, [activeStyleId, onOpenChange, styleId]);

	const updateStyleName = useCallback(
		(name: string) => {
			if (!styleId) return;
			CustomStylesStore.getState().updateStyleMeta(styleId, { name });
		},
		[styleId],
	);

	const updateStyleFont = useCallback(
		(fontFamily: string) => {
			if (!styleId) return;
			CustomStylesStore.getState().updateStyleMeta(styleId, { fontFamily });
		},
		[styleId],
	);

	return {
		isOpen,
		styleExists,
		styleName,
		styleFontFamily,
		currentTheme,
		handleDelete,
		updateStyleName,
		updateStyleFont,
	};
};
