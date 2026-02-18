import Stripe from "stripe";
import { CloudflareEnv } from "./platform/types";

export const createStripeClient = (env: CloudflareEnv) => new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
});
