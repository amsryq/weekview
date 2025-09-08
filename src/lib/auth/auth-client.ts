import { stripeClient } from "@better-auth/stripe/client";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { auth } from ".";

export const authClient = createAuthClient({
	baseURL: process.env.NEXT_PUBLIC_APP_URL,
	plugins: [
		stripeClient({
			subscription: false,
		}),
		inferAdditionalFields<typeof auth>(),
	],
});

export const { signIn, signOut, signUp, useSession } = authClient;
