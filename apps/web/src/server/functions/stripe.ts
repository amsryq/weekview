import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { isString } from "../../lib/utils/predicates";
import { createAuth } from "../auth";
import { ENABLE_AUTH_PAYWALL_SERVER } from "../config/feature-flags";
import { createStripeClient } from "../stripe";

export const getStripeSession = createServerFn({ method: "GET" })
	.validator((sessionId: string) => sessionId)
	.handler(async ({ data: sessionId }) => {
		if (!ENABLE_AUTH_PAYWALL_SERVER) {
			throw new Error("Payments are disabled");
		}

		const auth = createAuth();
		const stripe = createStripeClient(process.env.STRIPE_SECRET_KEY!);

		const session = await stripe.checkout.sessions.retrieve(sessionId);

		// Logic from backend/src/index.ts
		const stripeCustomerId = isString(session.customer)
			? session.customer
			: session.customer?.id;

		let supporterExpiresAt: Date | null = null;

		if (session.metadata?.type === "supporter_payment" && stripeCustomerId) {
			const ctx = await auth.$context;
			// SAFETY: Better-auth user adapter returns the user record schema matching session user
			const user = (await ctx.adapter.findOne({
				model: "user",
				where: [{ field: "stripeCustomerId", value: stripeCustomerId }],
			})) as (typeof auth.$Infer.Session)["user"] | null;

			if (user) {
				if (user.supporterUntil && user.supporterUntil > new Date()) {
					supporterExpiresAt = user.supporterUntil;
				}
				// We skipping the fallback handleCheckoutCompleted call for simplicity, or we can add it verify safe
			}
		}

		return {
			status: session.status,
			customer_email: session.customer_email,
			amount_total: session.amount_total,
			currency: session.currency,
			payment_status: session.payment_status,
			supporter_expires_at: supporterExpiresAt
				? Math.floor(supporterExpiresAt.getTime() / 1000)
				: null,
		};
	});

export const generateCheckout = createServerFn({ method: "POST" }).handler(
	async () => {
		if (!ENABLE_AUTH_PAYWALL_SERVER) {
			throw new Error("Payments are disabled");
		}

		const auth = createAuth();
		const request = getRequest();
		const headers = request.headers;
		const url = new URL(request.url);

		const session = await auth.api.getSession({
			headers,
			query: { disableCookieCache: true },
		});

		const customerId = session?.user.stripeCustomerId;
		if (!customerId) {
			throw new Error("No Stripe customer linked to user");
		}

		const stripe = createStripeClient(process.env.STRIPE_SECRET_KEY!);
		const checkoutSession = await stripe.checkout.sessions.create({
			mode: "payment",
			customer: customerId,
			line_items: [
				{
					price: process.env.SUPPORTER_ONE_TIME_PRICE_ID!,
					quantity: 1,
				},
			],
			metadata: {
				type: "supporter_payment",
			},
			success_url: `${url.host}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${url.host}/payment-cancel`,
		});

		return { url: checkoutSession.url };
	},
);

export const removeSupporter = createServerFn({ method: "POST" }).handler(
	async () => {
		if (!ENABLE_AUTH_PAYWALL_SERVER) {
			throw new Error("Payments are disabled");
		}

		const auth = createAuth();
		const request = getRequest();
		const headers = request.headers;

		const session = await auth.api.getSession({ headers });
		if (!session?.user) {
			throw new Error("Unauthorized");
		}

		const ctx = await auth.$context;
		// Logic to remove supporter status
		await ctx.internalAdapter.updateUser(session.user.id, {
			supporterUntil: null,
		});

		return { success: true };
	},
);
