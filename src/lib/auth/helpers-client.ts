import { Subscription } from "@better-auth/stripe";

export function getActiveSubscription(
	subscriptions: Subscription[],
): Subscription | undefined {
	return subscriptions.find(
		(sub) => sub.status === "active" || sub.status === "trialing",
	);
}
