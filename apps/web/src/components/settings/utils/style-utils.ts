import { type TimetableStyle } from "~/lib/models/style";

export const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function getCustomStyle(
	state: {
		styles: TimetableStyle[];
	},
	styleId: string | null,
) {
	if (!styleId) return null;
	return state.styles.find((item) => item.id === styleId) ?? null;
}

export function normalizeHexColor(value: string): string | null {
	const trimmed = value.trim();
	if (!HEX_COLOR_REGEX.test(trimmed)) {
		return null;
	}

	if (trimmed.length === 4) {
		const [r, g, b] = trimmed.slice(1);
		return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
	}

	return trimmed.toLowerCase();
}
