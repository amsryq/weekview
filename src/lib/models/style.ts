import { ColorEntry } from "./color-entry";

export interface TimetableStyle {
	id: string;
	name: string;
	fontFamily: string;
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
	{
		id: "ocean",
		name: "Ocean",
		fontFamily: "Manrope",
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
	{
		id: "sunset",
		name: "Sunset",
		fontFamily: "Poppins",
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
	{
		id: "forest",
		name: "Forest",
		fontFamily: "Nunito",
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
	{
		id: "midnight",
		name: "Midnight",
		fontFamily: "Roboto",
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
];

export const DEFAULT_TIMETABLE_STYLE_ID = TIMETABLE_STYLES[0].id;
export const DARK_TIMETABLE_STYLE_ID = "midnight";

export function getStyleById(styleId: string): TimetableStyle {
	return (
		TIMETABLE_STYLES.find((style) => style.id === styleId) ??
		TIMETABLE_STYLES[0]
	);
}

export function getStyleColorByIndex(
	styleId: string,
	index: number,
): ColorEntry.Schema {
	const style = getStyleById(styleId);
	const paletteIndex =
		((index % style.gridColors.length) + style.gridColors.length) %
		style.gridColors.length;
	return style.gridColors[paletteIndex];
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
