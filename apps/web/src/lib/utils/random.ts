/**
 * Returns a RFC4122-compliant v4 UUID string.
 * Uses `crypto.randomUUID` if available, otherwise falls back to a custom implementation.
 *
 * Note: `crypto.randomUUID` is available only on secure contexts in most browsers: https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID
 */

export function randomUUID(): string {
	if (
		typeof window !== "undefined" &&
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
