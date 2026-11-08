import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Returns `false` during SSR and the first client render, then `true` once
 * hydration has completed.
 */
export function useMounted() {
	return useSyncExternalStore(
		subscribe,
		() => true,
		() => false,
	);
}
