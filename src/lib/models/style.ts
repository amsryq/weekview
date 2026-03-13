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
	gridColors: [
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		ColorEntry.Schema,
		...ColorEntry.Schema[],
	];
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
					labelColor: "#475569",
					timeColor: "#64748b",
					gridLineColor: "#cbd5e1",
				},
				gridColors: [
					solid("#2563eb"),
					solid("#0f766e"),
					solid("#7c3aed"),
					solid("#dc2626"),
					solid("#ca8a04"),
					solid("#db2777"),
					solid("#0891b2"),
					solid("#ea580c"),
					solid("#4f46e5"),
					solid("#15803d"),
				],
			},
			dark: {
				background: { color: "#0f172a" },
				chrome: {
					labelColor: "#cbd5e1",
					timeColor: "#94a3b8",
					gridLineColor: "#334155",
				},
				gridColors: [
					solid("#60a5fa"),
					solid("#2dd4bf"),
					solid("#a78bfa"),
					solid("#f87171"),
					solid("#facc15"),
					solid("#f472b6"),
					solid("#22d3ee"),
					solid("#fb923c"),
					solid("#818cf8"),
					solid("#4ade80"),
				],
			},
		},
	},
	{
		id: "ocean",
		name: "Ocean",
		fontFamily: "Manrope",
		variants: {
			light: {
				background: { color: "#ecfeff" },
				chrome: {
					labelColor: "#0e7490",
					timeColor: "#155e75",
					gridLineColor: "#a5f3fc",
				},
				gridColors: [
					solid("#155e75"),
					solid("#0369a1"),
					solid("#0284c7"),
					solid("#0891b2"),
					solid("#0e7490"),
					solid("#0f766e"),
					solid("#0d9488"),
					solid("#06b6d4"),
					solid("#14b8a6"),
					solid("#2dd4bf"),
				],
			},
			dark: {
				background: { color: "#082f49" },
				chrome: {
					labelColor: "#a5f3fc",
					timeColor: "#67e8f9",
					gridLineColor: "#155e75",
				},
				gridColors: [
					solid("#22d3ee"),
					solid("#38bdf8"),
					solid("#0ea5e9"),
					solid("#06b6d4"),
					solid("#14b8a6"),
					solid("#2dd4bf"),
					solid("#5eead4"),
					solid("#67e8f9"),
					solid("#7dd3fc"),
					solid("#93c5fd"),
				],
			},
		},
	},
	{
		id: "sunset",
		name: "Sunset",
		fontFamily: "Poppins",
		variants: {
			light: {
				background: { color: "#fff7ed" },
				chrome: {
					labelColor: "#9a3412",
					timeColor: "#c2410c",
					gridLineColor: "#fdba74",
				},
				gridColors: [
					solid("#9a3412"),
					solid("#c2410c"),
					solid("#ea580c"),
					solid("#f97316"),
					solid("#dc2626"),
					solid("#e11d48"),
					solid("#db2777"),
					solid("#be185d"),
					solid("#c026d3"),
					solid("#a855f7"),
				],
			},
			dark: {
				background: { color: "#431407" },
				chrome: {
					labelColor: "#fed7aa",
					timeColor: "#fdba74",
					gridLineColor: "#9a3412",
				},
				gridColors: [
					solid("#fdba74"),
					solid("#fb923c"),
					solid("#f97316"),
					solid("#fb7185"),
					solid("#f43f5e"),
					solid("#f472b6"),
					solid("#e879f9"),
					solid("#d946ef"),
					solid("#c084fc"),
					solid("#a78bfa"),
				],
			},
		},
	},
	{
		id: "forest",
		name: "Forest",
		fontFamily: "Nunito",
		variants: {
			light: {
				background: { color: "#f0fdf4" },
				chrome: {
					labelColor: "#166534",
					timeColor: "#15803d",
					gridLineColor: "#86efac",
				},
				gridColors: [
					solid("#14532d"),
					solid("#166534"),
					solid("#15803d"),
					solid("#16a34a"),
					solid("#22c55e"),
					solid("#0f766e"),
					solid("#047857"),
					solid("#65a30d"),
					solid("#4d7c0f"),
					solid("#3f6212"),
				],
			},
			dark: {
				background: { color: "#052e16" },
				chrome: {
					labelColor: "#bbf7d0",
					timeColor: "#86efac",
					gridLineColor: "#166534",
				},
				gridColors: [
					solid("#4ade80"),
					solid("#34d399"),
					solid("#2dd4bf"),
					solid("#22c55e"),
					solid("#84cc16"),
					solid("#a3e635"),
					solid("#6ee7b7"),
					solid("#10b981"),
					solid("#bef264"),
					solid("#4d7c0f"),
				],
			},
		},
	},
	{
		id: "midnight",
		name: "Midnight",
		fontFamily: "Roboto",
		variants: {
			light: {
				background: { color: "#f1f5f9" },
				chrome: {
					labelColor: "#334155",
					timeColor: "#475569",
					gridLineColor: "#cbd5e1",
				},
				gridColors: [
					solid("#1d4ed8"),
					solid("#0369a1"),
					solid("#0f766e"),
					solid("#4338ca"),
					solid("#7c3aed"),
					solid("#6d28d9"),
					solid("#be123c"),
					solid("#b45309"),
					solid("#334155"),
					solid("#475569"),
				],
			},
			dark: {
				background: { color: "#0f172a" },
				chrome: {
					labelColor: "#cbd5e1",
					timeColor: "#94a3b8",
					gridLineColor: "#334155",
				},
				gridColors: [
					solid("#1d4ed8"),
					solid("#0369a1"),
					solid("#0f766e"),
					solid("#4338ca"),
					solid("#7c3aed"),
					solid("#6d28d9"),
					solid("#be123c"),
					solid("#b45309"),
					solid("#334155"),
					solid("#475569"),
				],
			},
		},
	},
];

export const DEFAULT_TIMETABLE_STYLE_ID = TIMETABLE_STYLES[0].id;

export function getStyleById(styleId: string): TimetableStyle {
	return (
		TIMETABLE_STYLES.find((style) => style.id === styleId) ??
		TIMETABLE_STYLES[0]
	);
}

export function getStyleVariantById(
	styleId: string,
	mode: TimetableColorMode,
): TimetableStyleVariant {
	return getStyleById(styleId).variants[mode];
}

export function getStyleColorByIndex(
	styleId: string,
	index: number,
	mode: TimetableColorMode = "light",
): ColorEntry.Schema {
	const styleVariant = getStyleVariantById(styleId, mode);
	const paletteIndex =
		((index % styleVariant.gridColors.length) + styleVariant.gridColors.length) %
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
