import { createStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { type ColorEntry } from "../models/color-entry";
import {
	getStyleById,
	isBuiltInStyle,
	type TimetableColorMode,
	type TimetableStyle,
} from "../models/style";
import { randomUUID } from "../utils/random";

interface State {
	styles: TimetableStyle[];
}

interface Actions {
	createFromBuiltIn: (baseStyleId: string, name?: string) => string;
	updateStyleMeta: (
		styleId: string,
		data: Partial<Pick<TimetableStyle, "name" | "fontFamily">>,
	) => void;
	updateVariantBackground: (
		styleId: string,
		mode: TimetableColorMode,
		color: string,
	) => void;
	updateVariantChrome: (
		styleId: string,
		mode: TimetableColorMode,
		key: keyof TimetableStyle["variants"][TimetableColorMode]["chrome"],
		color: string,
	) => void;
	updateVariantGridColor: (
		styleId: string,
		mode: TimetableColorMode,
		index: number,
		entry: ColorEntry.Schema,
	) => void;
	deleteStyle: (styleId: string) => void;
}

function cloneColorEntry(entry: ColorEntry.Schema): ColorEntry.Schema {
	if (entry.type === "solid") {
		return {
			type: "solid",
			color: entry.color,
			predefined: false,
		};
	}

	return {
		type: "gradient",
		gradientColors: [...entry.gradientColors],
		gradientDirection: entry.gradientDirection,
		predefined: false,
	};
}

function cloneStyle(
	style: TimetableStyle,
	overrides?: Partial<TimetableStyle>,
): TimetableStyle {
	return {
		id: overrides?.id ?? style.id,
		name: overrides?.name ?? style.name,
		fontFamily: overrides?.fontFamily ?? style.fontFamily,
		variants: {
			light: {
				background: { color: style.variants.light.background.color },
				chrome: { ...style.variants.light.chrome },
				gridColors: style.variants.light.gridColors.map(cloneColorEntry),
			},
			dark: {
				background: { color: style.variants.dark.background.color },
				chrome: { ...style.variants.dark.chrome },
				gridColors: style.variants.dark.gridColors.map(cloneColorEntry),
			},
		},
	};
}

export const CustomStylesStore = createStore<State & Actions>()(
	persist(
		immer((set) => ({
			styles: [],

			createFromBuiltIn: (baseStyleId, name) => {
				const baseStyle = getStyleById(baseStyleId);
				const styleId = randomUUID();
				set((state) => {
					state.styles.push(
						cloneStyle(baseStyle, {
							id: styleId,
							name: name?.trim() || `${baseStyle.name} Custom`,
						}),
					);
				});
				return styleId;
			},

			updateStyleMeta: (styleId, data) =>
				set((state) => {
					const style = state.styles.find((item) => item.id === styleId);
					if (!style) return;
					if (data.name !== undefined) {
						style.name = data.name;
					}
					if (data.fontFamily !== undefined) {
						style.fontFamily = data.fontFamily;
					}
				}),

			updateVariantBackground: (styleId, mode, color) =>
				set((state) => {
					const style = state.styles.find((item) => item.id === styleId);
					if (!style) return;
					style.variants[mode].background.color = color;
				}),

			updateVariantChrome: (styleId, mode, key, color) =>
				set((state) => {
					const style = state.styles.find((item) => item.id === styleId);
					if (!style) return;
					style.variants[mode].chrome[key] = color;
				}),

			updateVariantGridColor: (styleId, mode, index, entry) =>
				set((state) => {
					const style = state.styles.find((item) => item.id === styleId);
					if (!style) return;
					style.variants[mode].gridColors[index] = cloneColorEntry(entry);
				}),

			deleteStyle: (styleId) =>
				set((state) => {
					if (isBuiltInStyle(styleId)) return;
					state.styles = state.styles.filter((style) => style.id !== styleId);
				}),
		})),
		{
			name: "weekview-custom-styles",
		},
	),
);
