import { stripe } from "@better-auth/stripe";
import { betterAuth } from "better-auth";
import { invariant } from "es-toolkit";
import Stripe from "stripe";
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
			onEvent: async (event) => {
				const ctx = await auth.$context;

				switch (event.type) {
					case "checkout.session.completed": {
						const session = event.data.object as Stripe.Checkout.Session;
						const stripeCustomerId =
							typeof session.customer === "string"
								? session.customer
								: session.customer?.id;

						invariant(stripeCustomerId, "No stripe customer ID on session");

						const isSupporter = session.metadata?.type === "supporter_payment";

						if (isSupporter) {
							const supporterUntil = new Date();
							supporterUntil.setMonth(supporterUntil.getMonth() + 1);

							await ctx.adapter.update({
								model: "user",
								where: [{ field: "stripeCustomerId", value: stripeCustomerId }],
								update: { supporterUntil },
							});
						}

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
