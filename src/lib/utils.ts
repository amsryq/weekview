import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
	BackgroundAppearance,
	GradientDirection,
} from "./models/cell-appearance";

/**
 * Returns a RFC4122-compliant v4 UUID string.
 * Uses `crypto.randomUUID` if available, otherwise falls back to a custom implementation.
 *
 * Note: `crypto.randomUUID` is available only on secure contexts in most browsers: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
 */
export function randomUUID(): string {
	if (
		typeof crypto !== "undefined" &&
		typeof crypto.randomUUID === "function"
	) {
		return crypto.randomUUID();
	}
	// Fallback: generate RFC4122 v4 UUID
	// https://stackoverflow.com/a/2117523/2715716
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0;
		const v = c === "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Converts gradient direction enum to CSS linear-gradient direction
 */
function gradientDirectionToCSS(direction: GradientDirection): string {
	const directionMap: Record<GradientDirection, string> = {
		"to-r": "to right",
		"to-l": "to left",
		"to-t": "to top",
		"to-b": "to bottom",
		"to-tr": "to top right",
		"to-tl": "to top left",
		"to-br": "to bottom right",
		"to-bl": "to bottom left",
	};
	return directionMap[direction];
}

/**
 * Generates CSS background style from background appearance configuration
 */
export function getBackgroundStyle(
	background: BackgroundAppearance,
): React.CSSProperties {
	if (background.type === "solid") {
		return { backgroundColor: background.color };
	}

	if (
		background.type === "gradient" &&
		background.gradientColors &&
		background.gradientColors.length >= 2
	) {
		const direction = background.gradientDirection || "to-r";
		const colors = background.gradientColors.join(", ");
		return {
			background: `linear-gradient(${gradientDirectionToCSS(direction)}, ${colors})`,
		};
	}

	// Fallback to solid color if gradient is incomplete
	return { backgroundColor: background.gradientColors[0] || "#000000" };
}
