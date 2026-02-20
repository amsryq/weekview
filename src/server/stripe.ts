import Stripe from "stripe";

export const createStripeClient = (secret: string) => new Stripe(secret, {
    apiVersion: "2025-08-27.basil",
});
