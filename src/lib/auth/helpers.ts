"use server";

import { Subscription } from "@better-auth/stripe";
import { headers } from "next/headers";
import { auth } from ".";

export async function fetchUserSubscriptions(
	userId: string,
): Promise<Subscription[]> {
	return await auth.api.listActiveSubscriptions({
		query: { referenceId: userId },
		headers: await headers(),
	});
}
