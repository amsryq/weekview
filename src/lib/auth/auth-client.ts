import { stripeClient } from "@better-auth/stripe/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useEffect } from "react";
import { useCookie } from "../hooks/cookies";

export const authClient = createAuthClient({
	baseURL: typeof window !== "undefined" ? new URL(window.location.origin).toString() : "http://localhost:3000",
	plugins: [
		stripeClient({
			subscription: false,
		}),
		inferAdditionalFields({
			user: {
				supporterUntil: {
					type: "date",
					input: false,
					required: false,
				},
				// Not entirely sure why we need to explicitly set this. Should be on better-auth/stripe plugin
				stripeCustomerId: {
					type: "string",
					input: false,
					required: false,
				},
			},
		}),
	],
});

/**
 * Hook to get the current authenticated session.
 *
 * This version of useSession ONLY fetches session data if the user is logged in, as opposed to the original hook.
 * This avoids unnecessary requests to the backend when the user is not authenticated.
 */
export function useSession(options?: {
	refetchOnWindowFocus?: boolean | "always";
}) {
	const queryClient = useQueryClient();
	const isLoggedIn = useCookie("__Secure-weekview-auth.is_logged_in") === "1";

	const sessionQuery = useQuery({
		queryKey: ["session", isLoggedIn],
		queryFn: async () => {
			const s = await authClient.getSession();
			return s ?? null;
		},
		enabled: isLoggedIn,
		refetchOnWindowFocus: options?.refetchOnWindowFocus,
	});

	useEffect(() => {
		if (!isLoggedIn) {
			// clear cached session and stop any ongoing fetches when logged out
			queryClient.setQueryData(["session"], null);
			queryClient.cancelQueries({ queryKey: ["session"] });
		}
	}, [isLoggedIn, queryClient]);

	const refetch = async () => {
		return sessionQuery.refetch();
	};

	return {
		data: sessionQuery.data?.data ?? null,
		isPending: sessionQuery.isFetching,
		error: sessionQuery.error ?? null,
		refetch,
	};
}

export const { signIn, signOut, signUp } = authClient;
