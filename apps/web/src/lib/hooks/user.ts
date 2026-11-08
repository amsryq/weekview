import { ENABLE_AUTH_PAYWALL } from "~/lib/config/feature-flags";
import { useSession } from "../auth/auth-client";

export function useUser() {
	const session = useSession();
	if (!ENABLE_AUTH_PAYWALL) {
		return null;
	}

	return session.data?.user ?? null;
}

/**
 * Supporter status is inherently time-dependent, so it is evaluated against
 * the current time wherever it is rendered.
 */
export function isSupporterActive(
	supporterUntil: Date | null | undefined,
): boolean {
	if (!supporterUntil) return false;
	return supporterUntil.getTime() > Date.now();
}

export function useIsUserSupporter() {
	return isSupporterActive(useUser()?.supporterUntil);
}
