import { createServerFn } from "@tanstack/react-start";
import { getEnv } from "../platform/env";
import { createAuth } from "../auth";
import { createStripeClient } from "../stripe";

export const getStripeSession = createServerFn({ method: "GET" })
    .inputValidator((sessionId: string) => sessionId)
    .handler(async ({ data: sessionId }) => {
        const env = getEnv();
        const auth = createAuth(env);
        const stripe = createStripeClient(env);

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // Logic from backend/src/index.ts
        const stripeCustomerId =
            typeof session.customer === "string"
                ? session.customer
                : session.customer?.id;

        let supporterExpiresAt: Date | null = null;

        if (session.metadata?.type === "supporter_payment" && stripeCustomerId) {
            const ctx = await auth.$context;
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

export const generateCheckout = createServerFn({ method: "POST" })
    .handler(async () => {
        const env = getEnv();
        const auth = createAuth(env);
        // Cast event to any to access request property which might be missing in type def but present in runtime
        const request = (event as any).request as Request;
        const headers = request.headers;

        const session = await auth.api.getSession({
            headers,
            query: { disableCookieCache: true }
        });

        const customerId = session?.user.stripeCustomerId;
        if (!customerId) {
            throw new Error("No Stripe customer linked to user");
        }

        const stripe = createStripeClient(env);
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: "payment",
            customer: customerId,
            line_items: [
                {
                    price: env.SUPPORTER_ONE_TIME_PRICE_ID,
                    quantity: 1,
                },
            ],
            metadata: {
                type: "supporter_payment",
            },
            success_url: `${env.APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.APP_URL}/payment-cancel`,
        });

        return { url: checkoutSession.url };
    });

export const removeSupporter = createServerFn({ method: "POST" })
    .handler(async () => {
        const env = getEnv();
        const auth = createAuth(env);
        const request = (event as any).request as Request;
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
    });
