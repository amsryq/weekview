import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query subscription. Returns `false` on the server and during
 * the first client render, then tracks the live match state.
 */
export function useMediaQuery(query: string): boolean {
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			const media = window.matchMedia(query);
			media.addEventListener("change", onStoreChange);
			return () => media.removeEventListener("change", onStoreChange);
		},
		[query],
	);

	return useSyncExternalStore(
		subscribe,
		() => window.matchMedia(query).matches,
		() => false,
	);
}
