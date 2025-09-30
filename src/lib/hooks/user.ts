import { useSession } from "../auth/auth-client";

export function useUser() {
	const session = useSession();
	return session.data?.user ?? null;
}

export function useIsUserSupporter() {
	const supporterUntil = useUser()?.supporterUntil;
	if (!supporterUntil) return false;
	return supporterUntil > new Date();
}
