import { Subscription } from "@better-auth/stripe";
import { authClient } from "./auth-client";

export async function fetchUserSubscriptions(userId: string) {
	// TODO: wtf you can do this client side? how about security? investigate this
	const { data, error } = await authClient.subscription.list({
		query: { referenceId: userId },
	});

	if (error) {
		return [undefined, error] as const;
	}

	return [data, undefined] as const;
}

export async function getUserSubscriptionInfo(
	userId: string,
): Promise<Subscription | undefined> {
	const [subscriptions] = await fetchUserSubscriptions(userId);
	return subscriptions?.[0];
}

export async function isUserSubscriptionActive(userId: string) {
	const subscriptionInfo = await getUserSubscriptionInfo(userId);
	return subscriptionInfo?.status === "active";
}
