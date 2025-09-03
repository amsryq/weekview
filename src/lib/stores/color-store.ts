import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { BackgroundAppearance } from "../models/cell-appearance";
import { ColorEntry } from "../models/color";
import { randomUUID } from "../utils";

interface State {
	colors: ColorEntry[];
}

interface Actions {
	addColor: (background: BackgroundAppearance, name?: string) => string;
	removeColor: (colorId: string) => boolean;
	updateColor: (
		colorId: string,
		background: BackgroundAppearance,
		name?: string,
	) => boolean;
	getColor: (colorId: string) => ColorEntry | undefined;
	getColorsByType: (type: "solid" | "gradient") => ColorEntry[];
	getUserColors: () => ColorEntry[];
	getPredefinedColors: () => ColorEntry[];
}

// Predefined colors
const PREDEFINED_COLORS: { name: string; background: BackgroundAppearance }[] =
	[
		// Solid colors
		{ name: "Red", background: { type: "solid", color: "#ef4444" } },
		{ name: "Green", background: { type: "solid", color: "#22c55e" } },
		{ name: "Blue", background: { type: "solid", color: "#3b82f6" } },
		{ name: "Yellow", background: { type: "solid", color: "#eab308" } },
		{ name: "Purple", background: { type: "solid", color: "#a855f7" } },
		{ name: "Pink", background: { type: "solid", color: "#ec4899" } },
		{ name: "Orange", background: { type: "solid", color: "#f97316" } },
		{ name: "Teal", background: { type: "solid", color: "#14b8a6" } },
		{ name: "Indigo", background: { type: "solid", color: "#6366f1" } },
		{ name: "Gray", background: { type: "solid", color: "#6b7280" } },

		// Gradient colors
		{
			name: "Sunset",
			background: {
				type: "gradient",
				gradientColors: ["#f97316", "#ef4444"],
				gradientDirection: "to-br",
			},
		},
		{
			name: "Ocean",
			background: {
				type: "gradient",
				gradientColors: ["#06b6d4", "#3b82f6"],
				gradientDirection: "to-r",
			},
		},
		{
			name: "Forest",
			background: {
				type: "gradient",
				gradientColors: ["#16a34a", "#065f46"],
				gradientDirection: "to-b",
			},
		},
		{
			name: "Lavender",
			background: {
				type: "gradient",
				gradientColors: ["#a855f7", "#ec4899"],
				gradientDirection: "to-tr",
			},
		},
		{
			name: "Gold",
			background: {
				type: "gradient",
				gradientColors: ["#f59e0b", "#eab308"],
				gradientDirection: "to-r",
			},
		},
	];

function initializePredefinedColors(state: State) {
	const existingPredefinedIds = new Set(
		state.colors.filter((c) => c.isPredefined).map((c) => c.name),
	);

	for (const predefined of PREDEFINED_COLORS) {
		if (!existingPredefinedIds.has(predefined.name)) {
			const colorEntry = new ColorEntry({
				id: randomUUID(),
				name: predefined.name,
				background: predefined.background,
				isPredefined: true,
			});
			state.colors.push(colorEntry);
		}
	}
}

const ColorStore = createStore<State & Actions>()(
	persist(
		immer((set, get) => ({
			colors: [],

			addColor: (background, name) => {
				const id = randomUUID();
				const colorEntry = new ColorEntry({
					id,
					name,
					background,
					isPredefined: false,
					createdAt: new Date(),
				});

				set((state) => {
					state.colors.push(colorEntry);
				});

				return id;
			},

			removeColor: (colorId) => {
				const state = get();
				const color = state.colors.find((c) => c.id === colorId);

				// Don't allow removing predefined colors
				if (!color || color.isPredefined) {
					return false;
				}

				set((state) => {
					state.colors = state.colors.filter((c) => c.id !== colorId);
				});

				return true;
			},

			updateColor: (colorId, background, name) => {
				const state = get();
				const color = state.colors.find((c) => c.id === colorId);

				// Don't allow updating predefined colors
				if (!color || color.isPredefined) {
					return false;
				}

				set((state) => {
					const colorIndex = state.colors.findIndex((c) => c.id === colorId);
					if (colorIndex !== -1) {
						state.colors[colorIndex].background = background;
						if (name !== undefined) {
							state.colors[colorIndex].name = name;
						}
					}
				});

				return true;
			},

			getColor: (colorId) => {
				return get().colors.find((c) => c.id === colorId);
			},

			getColorsByType: (type) => {
				return get().colors.filter((c) => c.background.type === type);
			},

			getUserColors: () => {
				return get().colors.filter((c) => !c.isPredefined);
			},

			getPredefinedColors: () => {
				return get().colors.filter((c) => c.isPredefined);
			},
		})),
		{
			name: "taiki-color-store",
			// Initialize predefined colors on first load
			onRehydrateStorage: () => (state) => {
				if (state) {
					initializePredefinedColors(state);
				}
			},
		},
	),
);

export const useColorStore = <T>(selector: (state: State & Actions) => T) =>
	useStore(ColorStore, selector);
