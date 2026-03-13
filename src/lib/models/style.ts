import { ColorEntry } from "./color-entry";

export type TimetableColorMode = "light" | "dark";

export type TimetableThemePreference = "follow-app" | TimetableColorMode;

export interface TimetableStyleVariant {
	background: {
		color: string;
	};
	chrome: {
		labelColor: string;
		timeColor: string;
		gridLineColor: string;
	};
	gridColors: ColorEntry.Schema[];
}

export interface TimetableStyle {
	id: string;
	name: string;
	fontFamily: string;
	variants: {
		light: TimetableStyleVariant;
		dark: TimetableStyleVariant;
	};
}

const solid = (color: string): ColorEntry.Schema => ({
	type: "solid",
	color,
	predefined: true,
});

export const TIMETABLE_STYLES: TimetableStyle[] = [
	{
		id: "classic",
		name: "Classic",
		fontFamily: "Inter",
		variants: {
			light: {
				background: { color: "#f8fafc" },
				chrome: {
					labelColor: "#334155",
					timeColor: "#64748b",
					gridLineColor: "#e2e8f0",
				},
				gridColors: [
					solid("#2563eb"), // blue
					solid("#059669"), // emerald
					solid("#7c3aed"), // violet
					solid("#dc2626"), // red
					solid("#0891b2"), // cyan
					solid("#c026d3"), // fuchsia
					solid("#b45309"), // amber
					solid("#4f46e5"), // indigo
					solid("#0d9488"), // teal
					solid("#be123c"), // rose
				],
			},
			dark: {
				background: { color: "#0f172a" },
				chrome: {
					labelColor: "#cbd5e1",
					timeColor: "#94a3b8",
					gridLineColor: "#1e293b",
				},
				gridColors: [
					solid("#3b82f6"), // blue
					solid("#10b981"), // emerald
					solid("#8b5cf6"), // violet
					solid("#ef4444"), // red
					solid("#06b6d4"), // cyan
					solid("#d946ef"), // fuchsia
					solid("#d97706"), // amber
					solid("#6366f1"), // indigo
					solid("#14b8a6"), // teal
					solid("#f43f5e"), // rose
				],
			},
		},
	},
	{
		id: "jewel",
		name: "Jewel",
		fontFamily: "Manrope",
		variants: {
			light: {
				background: { color: "#faf9f6" },
				chrome: {
					labelColor: "#3f3f46",
					timeColor: "#71717a",
					gridLineColor: "#d4d4d8",
				},
				gridColors: [
					solid("#1e40af"), // sapphire
					solid("#047857"), // emerald
					solid("#6d28d9"), // amethyst
					solid("#b91c1c"), // ruby
					solid("#0e7490"), // aquamarine
					solid("#a21caf"), // tourmaline
					solid("#92400e"), // citrine
					solid("#3730a3"), // tanzanite
					solid("#115e59"), // jade
					solid("#9f1239"), // garnet
				],
			},
			dark: {
				background: { color: "#18181b" },
				chrome: {
					labelColor: "#d4d4d8",
					timeColor: "#a1a1aa",
					gridLineColor: "#27272a",
				},
				gridColors: [
					solid("#2563eb"), // sapphire
					solid("#059669"), // emerald
					solid("#7c3aed"), // amethyst
					solid("#dc2626"), // ruby
					solid("#0891b2"), // aquamarine
					solid("#c026d3"), // tourmaline
					solid("#b45309"), // citrine
					solid("#4f46e5"), // tanzanite
					solid("#0f766e"), // jade
					solid("#be123c"), // garnet
				],
			},
		},
	},
	{
		id: "candy",
		name: "Candy",
		fontFamily: "Nunito",
		variants: {
			light: {
				background: { color: "#fdf2f8" },
				chrome: {
					labelColor: "#831843",
					timeColor: "#9d174d",
					gridLineColor: "#f9a8d4",
				},
				gridColors: [
					solid("#be185d"), // hot pink
					solid("#7c3aed"), // grape
					solid("#0891b2"), // mint
					solid("#c2410c"), // tangerine
					solid("#4f46e5"), // blueberry
					solid("#15803d"), // apple
					solid("#a21caf"), // plum
					solid("#0369a1"), // bubblegum blue
					solid("#b91c1c"), // cherry
					solid("#0d9488"), // spearmint
				],
			},
			dark: {
				background: { color: "#1a0a14" },
				chrome: {
					labelColor: "#f9a8d4",
					timeColor: "#f472b6",
					gridLineColor: "#3b0a2a",
				},
				gridColors: [
					solid("#ec4899"), // hot pink
					solid("#8b5cf6"), // grape
					solid("#06b6d4"), // mint
					solid("#f97316"), // tangerine
					solid("#6366f1"), // blueberry
					solid("#22c55e"), // apple
					solid("#d946ef"), // plum
					solid("#0ea5e9"), // bubblegum blue
					solid("#ef4444"), // cherry
					solid("#14b8a6"), // spearmint
				],
			},
		},
	},
	{
		id: "terra",
		name: "Terra",
		fontFamily: "Poppins",
		variants: {
			light: {
				background: { color: "#faf5f0" },
				chrome: {
					labelColor: "#44403c",
					timeColor: "#78716c",
					gridLineColor: "#d6d3d1",
				},
				gridColors: [
					solid("#92400e"), // ochre
					solid("#166534"), // forest
					solid("#7c2d12"), // terracotta
					solid("#1e40af"), // lapis
					solid("#854d0e"), // bronze
					solid("#4c1d95"), // dusk purple
					solid("#065f46"), // moss
					solid("#9a3412"), // clay
					solid("#0e7490"), // river
					solid("#991b1b"), // brick
				],
			},
			dark: {
				background: { color: "#1c1412" },
				chrome: {
					labelColor: "#d6d3d1",
					timeColor: "#a8a29e",
					gridLineColor: "#2c2220",
				},
				gridColors: [
					solid("#d97706"), // ochre
					solid("#16a34a"), // forest
					solid("#ea580c"), // terracotta
					solid("#3b82f6"), // lapis
					solid("#ca8a04"), // bronze
					solid("#8b5cf6"), // dusk purple
					solid("#059669"), // moss
					solid("#f97316"), // clay
					solid("#06b6d4"), // river
					solid("#ef4444"), // brick
				],
			},
		},
	},
	{
		id: "cosmos",
		name: "Cosmos",
		fontFamily: "Roboto",
		variants: {
			light: {
				background: { color: "#f5f3ff" },
				chrome: {
					labelColor: "#3b0764",
					timeColor: "#6b21a8",
					gridLineColor: "#c4b5fd",
				},
				gridColors: [
					solid("#6d28d9"), // nebula purple
					solid("#0369a1"), // deep space blue
					solid("#be123c"), // red giant
					solid("#0f766e"), // aurora teal
					solid("#4338ca"), // cosmic indigo
					solid("#b45309"), // solar amber
					solid("#c026d3"), // supernova pink
					solid("#1d4ed8"), // stellar blue
					solid("#047857"), // alien green
					solid("#9f1239"), // mars red
				],
			},
			dark: {
				background: { color: "#0c0a1d" },
				chrome: {
					labelColor: "#c4b5fd",
					timeColor: "#a78bfa",
					gridLineColor: "#1e1b3a",
				},
				gridColors: [
					solid("#8b5cf6"), // nebula purple
					solid("#0ea5e9"), // deep space blue
					solid("#f43f5e"), // red giant
					solid("#14b8a6"), // aurora teal
					solid("#6366f1"), // cosmic indigo
					solid("#d97706"), // solar amber
					solid("#d946ef"), // supernova pink
					solid("#3b82f6"), // stellar blue
					solid("#10b981"), // alien green
					solid("#e11d48"), // mars red
				],
			},
		},
	},
];

export const DEFAULT_TIMETABLE_STYLE_ID = TIMETABLE_STYLES[0].id;

export function isBuiltInStyle(styleId: string): boolean {
	return TIMETABLE_STYLES.some((style) => style.id === styleId);
}

function getAllStyles(extraStyles: TimetableStyle[] = []): TimetableStyle[] {
	return [...TIMETABLE_STYLES, ...extraStyles];
}

export function getStyleById(
	styleId: string,
	extraStyles: TimetableStyle[] = [],
): TimetableStyle {
	return (
		getAllStyles(extraStyles).find((style) => style.id === styleId) ??
		TIMETABLE_STYLES[0]
	);
}

export function getStyleVariantById(
	styleId: string,
	mode: TimetableColorMode,
	extraStyles: TimetableStyle[] = [],
): TimetableStyleVariant {
	return getStyleById(styleId, extraStyles).variants[mode];
}

export function getStyleColorByIndex(
	styleId: string,
	index: number,
	mode: TimetableColorMode = "light",
	extraStyles: TimetableStyle[] = [],
): ColorEntry.Schema {
	const styleVariant = getStyleVariantById(styleId, mode, extraStyles);
	const paletteIndex =
		((index % styleVariant.gridColors.length) +
			styleVariant.gridColors.length) %
		styleVariant.gridColors.length;
	return styleVariant.gridColors[paletteIndex];
}

export function getStableStyleIndex(key: string, paletteSize = 10): number {
	if (paletteSize <= 0) return 0;

	let hash = 0;
	for (let i = 0; i < key.length; i++) {
		hash = (hash << 5) - hash + key.charCodeAt(i);
		hash |= 0;
	}

	return Math.abs(hash) % paletteSize;
}
