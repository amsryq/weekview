import Stripe from "stripe";
import { isString } from "../../lib/utils/predicates";

export interface CheckoutAuthContext {
	adapter: {
		update: (options: {
			model: string;
			where: Array<{ field: string; value: string }>;
			update: { supporterUntil: Date };
		}) => Promise<void | null | object>;
	};
}

export async function handleCheckoutCompleted(
	session: Stripe.Checkout.Session,
	ctx: CheckoutAuthContext,
) {
	const stripeCustomerId = isString(session.customer)
		? session.customer
		: session.customer?.id;

	if (!stripeCustomerId) {
		throw new Error("No stripe customer ID on session");
	}

	switch (session.metadata?.type) {
		case "supporter_payment": {
			const supporterUntil = new Date(session.created * 1000);
			supporterUntil.setMonth(supporterUntil.getMonth() + 1);

			await ctx.adapter.update({
				model: "user",
				where: [{ field: "stripeCustomerId", value: stripeCustomerId }],
				update: { supporterUntil },
			});

			break;
		}
	}
}
