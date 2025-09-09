import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { pg } from "../pg";
import { stripeClient } from "../stripe";
import { handleCheckoutCompleted } from "./handle-checkout";

export const auth = betterAuth({
	socialProviders: {
		// google: {
		// 	clientId: process.env.GOOGLE_CLIENT_ID!,
		// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		// },
		github: {
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		},
	},
	database: pg,
	plugins: [
		stripe({
			stripeClient,
			stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
			createCustomerOnSignUp: true,
			onEvent: async (event) => {
				const ctx = await auth.$context;

				switch (event.type) {
					case "checkout.session.completed": {
						await handleCheckoutCompleted(event.data.object, ctx);
						break;
					}
				}
			},
		}),
	],
	user: {
		additionalFields: {
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
	},
});
