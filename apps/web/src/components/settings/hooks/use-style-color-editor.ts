import { useCallback } from "react";
import { useStore } from "zustand";
import type { ColorEntry } from "~/lib/models/color-entry";
import { type TimetableColorMode } from "~/lib/models/style";
import { CustomStylesStore } from "~/lib/stores/custom-styles-store";
import { getCustomStyle } from "../utils/style-utils";

const CHROME_FIELD_KEYS = ["labelColor", "timeColor", "gridLineColor"] as const;

interface UseVariantColorFieldProps {
	styleId: string;
	mode: TimetableColorMode;
	fieldKey?: (typeof CHROME_FIELD_KEYS)[number];
	fieldType: "background" | "chrome" | "gridColor";
	index?: number;
}

export function useVariantColorField({
	styleId,
	mode,
	fieldKey,
	fieldType,
	index,
}: UseVariantColorFieldProps) {
	const value = useStore(
		CustomStylesStore,
		useCallback(
			(state) => {
				const style = getCustomStyle(state, styleId);
				if (!style) return fieldType === "gridColor" ? null : "#000000";

				if (fieldType === "background") {
					return style.variants[mode].background.color;
				}
				if (fieldType === "chrome" && fieldKey) {
					return style.variants[mode].chrome[fieldKey];
				}
				if (fieldType === "gridColor" && index !== undefined) {
					return style.variants[mode].gridColors[index] ?? null;
				}
				return "#000000";
			},
			[fieldKey, fieldType, index, mode, styleId],
		),
	);

	const onChange = useCallback(
		(nextValue: string | ColorEntry.Schema) => {
			if (fieldType === "background") {
				CustomStylesStore.getState().updateVariantBackground(
					styleId,
					mode,
					nextValue as string,
				);
			} else if (fieldType === "chrome" && fieldKey) {
				CustomStylesStore.getState().updateVariantChrome(
					styleId,
					mode,
					fieldKey,
					nextValue as string,
				);
			} else if (fieldType === "gridColor" && index !== undefined) {
				CustomStylesStore.getState().updateVariantGridColor(
					styleId,
					mode,
					index,
					nextValue as ColorEntry.Schema,
				);
			}
		},
		[fieldKey, fieldType, index, mode, styleId],
	);

	return { value, onChange };
}
