import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ColorEntry } from "../models/color-entry";

interface State {
	colors: ColorEntry[];
}

interface Actions {
	addColor: (color: ColorEntry.Schema) => string;
	removeColor: (colorId: string) => boolean;
	updateColor: (colorId: string, color: ColorEntry.Schema) => boolean;
	getColor: (colorId: string) => ColorEntry | undefined;
	getColorsByType: (type: "solid" | "gradient") => ColorEntry[];
	getUserColors: () => ColorEntry[];
	getPredefinedColors: () => ColorEntry[];
}

// Predefined colors
const PREDEFINED_COLORS: { name: string; color: ColorEntry.Schema }[] = [
	// Solid colors
	{ name: "Red", color: { type: "solid", color: "#ef4444" } },
	{ name: "Green", color: { type: "solid", color: "#22c55e" } },
	{ name: "Blue", color: { type: "solid", color: "#3b82f6" } },
	{ name: "Yellow", color: { type: "solid", color: "#eab308" } },
	{ name: "Purple", color: { type: "solid", color: "#a855f7" } },
	{ name: "Pink", color: { type: "solid", color: "#ec4899" } },
	{ name: "Orange", color: { type: "solid", color: "#f97316" } },
	{ name: "Teal", color: { type: "solid", color: "#14b8a6" } },
	{ name: "Indigo", color: { type: "solid", color: "#6366f1" } },
	{ name: "Gray", color: { type: "solid", color: "#6b7280" } },

	// Gradient colors
	{
		name: "Sunset",
		color: {
			type: "gradient",
			gradientColors: ["#f97316", "#ef4444"],
			gradientDirection: "to-br",
		},
	},
	{
		name: "Ocean",
		color: {
			type: "gradient",
			gradientColors: ["#06b6d4", "#3b82f6"],
			gradientDirection: "to-r",
		},
	},
	{
		name: "Forest",
		color: {
			type: "gradient",
			gradientColors: ["#16a34a", "#065f46"],
			gradientDirection: "to-b",
		},
	},
	{
		name: "Lavender",
		color: {
			type: "gradient",
			gradientColors: ["#a855f7", "#ec4899"],
			gradientDirection: "to-tr",
		},
	},
	{
		name: "Gold",
		color: {
			type: "gradient",
			gradientColors: ["#f59e0b", "#eab308"],
			gradientDirection: "to-r",
		},
	},
];

const ColorStore = createStore<State & Actions>()(
	persist(
		immer((set, get) => ({
			colors: [],

			addColor: (color) => {
				const colorEntry = ColorEntry.createFromSchema(color);

				set((state) => {
					state.colors.push(colorEntry);
				});

				return colorEntry.id;
			},

			removeColor: (colorId) => {
				const state = get();
				const color = state.colors.find((c) => c.id === colorId);

				// Don't allow removing predefined colors
				if (!color || color.predefined) {
					return false;
				}

				set((state) => {
					state.colors = state.colors.filter((c) => c.id !== colorId);
				});

				return true;
			},

			updateColor: (colorId, color) => {
				const state = get();
				const existingColor = state.colors.find((c) => c.id === colorId);

				// Don't allow updating predefined colors
				if (!existingColor || existingColor.predefined) {
					return false;
				}

				set((state) => {
					const colorIndex = state.colors.findIndex((c) => c.id === colorId);
					if (colorIndex !== -1) {
						state.colors[colorIndex].def = color;
					}
				});

				return true;
			},

			getColor: (colorId) => {
				return get().colors.find((c) => c.id === colorId);
			},

			getColorsByType: (type) => {
				return get().colors.filter((c) => c.def.type === type);
			},

			getUserColors: () => {
				return get().colors.filter((c) => !c.predefined);
			},

			getPredefinedColors: () => {
				return get().colors.filter((c) => c.predefined);
			},
		})),
		{
			name: "taiki-color-store",
			// Initialize predefined colors on first load
			onRehydrateStorage: () => (state) => {
				if (!state) return;

				// Ensure all colors are instances of ColorEntry
				for (let i = 0; i < state.colors.length; i++) {
					const color = state.colors[i];
					if (!(color instanceof ColorEntry)) {
						// @ts-expect-error
						state.colors[i] = new ColorEntry({ ...color });
					}
				}

				// Add missing predefined colors
				for (let i = 0; i < PREDEFINED_COLORS.length; i++) {
					const predefined = PREDEFINED_COLORS[i];
					if (predefined) {
						const exists = state.colors.find(
							(c) => c.predefined && c.id === `__predefined-${i}`,
						);
						if (!exists) {
							const colorEntry = new ColorEntry({
								id: `__predefined-${i}`,
								def: predefined.color,
								predefined: true,
							});
							state.colors.push(colorEntry);
						}
					}
				}

				return state;
			},
		},
	),
);

export const useColorStore = <T>(selector: (state: State & Actions) => T) =>
	useStore(ColorStore, selector);
