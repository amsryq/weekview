import { ENABLE_AUTH_PAYWALL } from "~/lib/config/feature-flags";
import { useSession } from "../auth/auth-client";

export function useUser() {
	const session = useSession();
	if (!ENABLE_AUTH_PAYWALL) {
		return null;
	}

	return session.data?.user ?? null;
}

export function useIsUserSupporter() {
	const supporterUntil = useUser()?.supporterUntil;
	if (!supporterUntil) return false;
	return supporterUntil > new Date();
}
