import { stripeClient } from "@better-auth/stripe/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_BACKEND_URL!,
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
		})
	],
});

export const { signIn, signOut, signUp, useSession } = authClient;
