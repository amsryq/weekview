import { AuthContext } from "better-auth";
import Stripe from "stripe";

export async function handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
    ctx: AuthContext,
) {
    const stripeCustomerId =
        typeof session.customer === "string"
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
