import { useCallback } from "react";
import { useStore } from "zustand";
import type { ColorEntry } from "~/lib/models/color-entry";
import { type TimetableColorMode } from "~/lib/models/style";
import { CustomStylesStore } from "~/lib/stores/custom-styles-store";
import { isString } from "~/lib/utils/predicates";
import { getCustomStyle } from "../utils/style-utils";

const CHROME_FIELD_KEYS = ["labelColor", "timeColor", "gridLineColor"] as const;

export interface BackgroundFieldProps {
	styleId: string;
	mode: TimetableColorMode;
	fieldType: "background";
	fieldKey?: never;
	index?: never;
}

export interface ChromeFieldProps {
	styleId: string;
	mode: TimetableColorMode;
	fieldKey: (typeof CHROME_FIELD_KEYS)[number];
	fieldType: "chrome";
	index?: never;
}

export interface GridColorFieldProps {
	styleId: string;
	mode: TimetableColorMode;
	fieldType: "gridColor";
	index: number;
	fieldKey?: never;
}

export interface StringColorFieldResult {
	value: string;
	onChange: (nextValue: string) => void;
}

export interface GridColorFieldResult {
	value: ColorEntry.Schema | null;
	onChange: (nextValue: ColorEntry.Schema) => void;
}

export interface AnyColorFieldResult {
	// oxlint-disable-next-line typescript/no-explicit-any
	value: any;
	// oxlint-disable-next-line typescript/no-explicit-any
	onChange: any;
}

export function useVariantColorField(
	props: BackgroundFieldProps | ChromeFieldProps,
): StringColorFieldResult;
export function useVariantColorField(
	props: GridColorFieldProps,
): GridColorFieldResult;
export function useVariantColorField({
	styleId,
	mode,
	fieldKey,
	fieldType,
	index,
}:
	| BackgroundFieldProps
	| ChromeFieldProps
	| GridColorFieldProps): AnyColorFieldResult {
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
			if (fieldType === "background" && isString(nextValue)) {
				CustomStylesStore.getState().updateVariantBackground(
					styleId,
					mode,
					nextValue,
				);
			} else if (fieldType === "chrome" && fieldKey && isString(nextValue)) {
				CustomStylesStore.getState().updateVariantChrome(
					styleId,
					mode,
					fieldKey,
					nextValue,
				);
			} else if (
				fieldType === "gridColor" &&
				index !== undefined &&
				!isString(nextValue)
			) {
				CustomStylesStore.getState().updateVariantGridColor(
					styleId,
					mode,
					index,
					nextValue,
				);
			}
		},
		[fieldKey, fieldType, index, mode, styleId],
	);

	return { value, onChange };
}
