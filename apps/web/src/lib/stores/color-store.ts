import Color from "color";
import { omit } from "es-toolkit";
import { createStore, useStore } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { ColorEntry } from "../models/color-entry";

interface State {
	colors: ColorEntry[];
	assignedSolidColors: Record<string, ColorEntry.Schema>;
}

interface Actions {
	addColor: (color: ColorEntry.Schema) => string;
	removeColor: (colorId: string) => boolean;
	updateColor: (colorId: string, color: ColorEntry.Schema) => boolean;
	getColor: (colorId: string) => ColorEntry | undefined;
	getColorsByType: (type: "solid" | "gradient") => ColorEntry[];
	getUserColors: () => ColorEntry[];
	getPredefinedColors: () => ColorEntry[];
	getOrAssignSolidColor: (key: string) => ColorEntry.Schema;
	releaseAssignedColor: (key: string) => void;
}

const PREDEFINED_COLORS_VERSION = "v1";
const PREDEFINED_COLORS: { name: string; color: ColorEntry.Schema }[] = [
	// Solid colors
	{ name: "Red", color: { type: "solid", color: "#dc2626" } },
	{ name: "Green", color: { type: "solid", color: "#16a34a" } },
	{ name: "Blue", color: { type: "solid", color: "#2563eb" } },
	{ name: "Yellow", color: { type: "solid", color: "#ca8a04" } },
	{ name: "Purple", color: { type: "solid", color: "#9333ea" } },
	{ name: "Pink", color: { type: "solid", color: "#db2777" } },
	{ name: "Orange", color: { type: "solid", color: "#ea580c" } },
	{ name: "Teal", color: { type: "solid", color: "#0f766e" } },
	{ name: "Indigo", color: { type: "solid", color: "#4f46e5" } },
	{ name: "Gray", color: { type: "solid", color: "#4b5563" } },

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

const SOLID_SATURATION_RANGE: [number, number] = [65, 85];
const SOLID_LIGHTNESS_RANGE: [number, number] = [30, 45];

function normalizeHexColor(hex: string): string {
	try {
		return Color(hex).hex().toLowerCase();
	} catch {
		// Fallback to original string if parsing fails; caller may sanitize further
		return (hex || "").toString().trim().toLowerCase();
	}
}

function isReadableOnWhite(hex: string): boolean {
	try {
		return Color(hex).contrast(Color("#ffffff")) >= 4.5;
	} catch {
		return false;
	}
}

function pickRandom<T>(values: T[]): T {
	return values[Math.floor(Math.random() * values.length)];
}

function generateReadableSolidColor(excludedColors: Set<string>): string {
	const maxAttempts = 24;
	for (let attempt = 0; attempt < maxAttempts; attempt++) {
		const hue = Math.random() * 360;
		const saturation =
			SOLID_SATURATION_RANGE[0] +
			Math.random() * (SOLID_SATURATION_RANGE[1] - SOLID_SATURATION_RANGE[0]);
		const lightness =
			SOLID_LIGHTNESS_RANGE[0] +
			Math.random() * (SOLID_LIGHTNESS_RANGE[1] - SOLID_LIGHTNESS_RANGE[0]);
		const candidate = normalizeHexColor(
			Color(`hsl(${hue}, ${saturation}%, ${lightness}%)`).hex(),
		);
		if (excludedColors.has(candidate)) continue;
		if (isReadableOnWhite(candidate)) return candidate;
	}

	const fallbackPalette = [
		"#1f2937",
		"#334155",
		"#2563eb",
		"#7c3aed",
		"#0369a1",
	];
	const availableFallback = fallbackPalette.find((c) => !excludedColors.has(c));
	return normalizeHexColor(availableFallback ?? fallbackPalette[0]);
}

function isSolidColorEntry(
	colorEntry: ColorEntry,
): colorEntry is ColorEntry & { def: { type: "solid"; color: string } } {
	return colorEntry.def.type === "solid";
}

const ColorStore = createStore<State & Actions>()(
	persist(
		immer((set, get) => ({
			colors: [],
			assignedSolidColors: {},

			addColor: (color) => {
				const sanitizedColor =
					color.type === "solid"
						? { ...color, color: normalizeHexColor(color.color) }
						: color;
				const colorEntry = ColorEntry.createFromSchema(sanitizedColor);

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
						if (color.type === "solid") {
							state.colors[colorIndex].def = {
								type: "solid",
								color: normalizeHexColor(color.color),
							};
						} else {
							state.colors[colorIndex].def = {
								type: "gradient",
								gradientColors: [...color.gradientColors!],
								gradientDirection: color.gradientDirection!,
							};
						}
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

			getOrAssignSolidColor: (key) => {
				const normalizedKey = key.trim().toLowerCase();
				const currentState = get();
				const existing = currentState.assignedSolidColors[normalizedKey];
				if (existing) {
					return { ...existing };
				}

				const assignedColors = new Set(
					Object.values(currentState.assignedSolidColors)
						.filter((assigned) => assigned.type === "solid")
						.map((assigned) => normalizeHexColor(assigned.color)),
				);

				const solidColors = currentState.colors.filter(isSolidColorEntry);
				const unusedSolidColors = solidColors.filter(
					(colorEntry) =>
						!assignedColors.has(normalizeHexColor(colorEntry.def.color)),
				);

				let selectedColor: ColorEntry.Schema;

				if (unusedSolidColors.length > 0) {
					const selectedEntry =
						unusedSolidColors.length === 1
							? unusedSolidColors[0]
							: pickRandom(unusedSolidColors);
					selectedColor = {
						type: "solid",
						color: normalizeHexColor(selectedEntry.def.color),
						predefined: selectedEntry.predefined,
					};
				} else {
					const excludedColors = new Set<string>(assignedColors);
					for (const entry of solidColors) {
						excludedColors.add(normalizeHexColor(entry.def.color));
					}
					const generatedColor = generateReadableSolidColor(excludedColors);
					const existingEntry = solidColors.find(
						(entry) => normalizeHexColor(entry.def.color) === generatedColor,
					);
					if (!existingEntry) {
						get().addColor({ type: "solid", color: generatedColor });
					}
					selectedColor = {
						type: "solid",
						color: generatedColor,
					};
				}

				set((state) => {
					state.assignedSolidColors[normalizedKey] = selectedColor;
				});

				return { ...selectedColor };
			},

			releaseAssignedColor: (key) => {
				const normalizedKey = key.trim().toLowerCase();
				set((state) => {
					delete state.assignedSolidColors[normalizedKey];
				});
			},
		})),
		{
			name: "taiki-color-store",
			partialize: (state) => omit(state, ["assignedSolidColors"]),
			// Initialize predefined colors on first load
			onRehydrateStorage: () => (state) => {
				if (!state) return;

				// Ensure all colors are instances of ColorEntry
				for (let i = 0; i < state.colors.length; i++) {
					const color = state.colors[i];
					if (!(color instanceof ColorEntry)) {
						if (
							(color as ColorEntry)?.id?.startsWith("__predefined-") &&
							!(color as ColorEntry)?.id?.includes(
								`-${PREDEFINED_COLORS_VERSION}-`,
							)
						) {
							// @ts-expect-error
							state.colors[i] = undefined;
							continue;
						}

						// @ts-expect-error
						state.colors[i] = new ColorEntry({ ...color });
					}
				}

				state.colors = state.colors.filter((c): c is ColorEntry => !!c);

				// Add missing predefined colors
				for (let i = 0; i < PREDEFINED_COLORS.length; i++) {
					const predefined = PREDEFINED_COLORS[i];
					if (predefined) {
						const exists = state.colors.find(
							(c) =>
								c.predefined &&
								c.id === `__predefined-${PREDEFINED_COLORS_VERSION}-${i}`,
						);

						if (!exists) {
							const colorEntry = new ColorEntry({
								id: `__predefined-${PREDEFINED_COLORS_VERSION}-${i}`,
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

export const getOrAssignSolidColorFor = (key: string) =>
	ColorStore.getState().getOrAssignSolidColor(key);

export const releaseAssignedColorFor = (key: string) =>
	ColorStore.getState().releaseAssignedColor(key);
