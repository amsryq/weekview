import Stripe from "stripe";
import { CloudflareEnv } from "./platform/types";

export const createStripeClient = (secret: string) => new Stripe(secret, {
    apiVersion: "2025-08-27.basil",
});
