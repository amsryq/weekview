import Stripe from "stripe";

export const createStripeClient = (secret: string) =>
	new Stripe(secret, {
		apiVersion: "2026-10-28.endive",
	});
