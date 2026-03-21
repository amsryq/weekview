import {
	getStyleById,
	getStyleColorByIndex,
	getStyleVariantById,
	TIMETABLE_STYLES,
	type TimetableColorMode,
	type TimetableStyle,
} from "../models/style";
import { CustomStylesStore } from "../stores/custom-styles-store";

export function getResolvedTimetableStyles(): TimetableStyle[] {
	return [...TIMETABLE_STYLES, ...CustomStylesStore.getState().styles];
}

export function resolveTimetableStyle(styleId: string): TimetableStyle {
	return getStyleById(styleId, CustomStylesStore.getState().styles);
}

export function resolveTimetableStyleVariant(
	styleId: string,
	mode: TimetableColorMode,
) {
	return getStyleVariantById(
		styleId,
		mode,
		CustomStylesStore.getState().styles,
	);
}

export function resolveTimetableStyleColorByIndex(
	styleId: string,
	index: number,
	mode: TimetableColorMode = "light",
) {
	return getStyleColorByIndex(
		styleId,
		index,
		mode,
		CustomStylesStore.getState().styles,
	);
}
