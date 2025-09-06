import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { pg } from "../pg";
import { stripeClient } from "../stripe";

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
			subscription: {
				enabled: true,
				plans: [
					{
						name: "supporter",
						priceId: "price_1RytTILDjUFZoEniwGIRgIfd",
					},
				],
			},
		}),
	],
});
