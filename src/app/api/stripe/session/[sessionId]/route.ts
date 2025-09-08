import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { stripeClient } from "~/lib/stripe";

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> },
) {
	try {
		const { sessionId } = await params;

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 },
			);
		}

		// Retrieve the checkout session from Stripe
		const session = await stripeClient.checkout.sessions.retrieve(sessionId);

		// Get the stripe customer ID
		const stripeCustomerId =
			typeof session.customer === "string"
				? session.customer
				: session.customer?.id;

		let supporterExpiresAt: Date | null = null;

		// If this is a supporter payment, get the supporter expiration from the database
		if (session.metadata?.type === "supporter_payment" && stripeCustomerId) {
			const ctx = await auth.$context;
			const user = (await ctx.adapter.findOne({
				model: "user",
				where: [{ field: "stripeCustomerId", value: stripeCustomerId }],
			})) as { supporterUntil?: Date } | null;

			supporterExpiresAt = user?.supporterUntil || null;
		}

		// Return relevant session data
		return NextResponse.json({
			status: session.status,
			customer_email: session.customer_email,
			amount_total: session.amount_total,
			currency: session.currency,
			payment_status: session.payment_status,
			supporter_expires_at: supporterExpiresAt
				? Math.floor(supporterExpiresAt.getTime() / 1000)
				: null, // Convert to Unix timestamp
		});
	} catch (error) {
		console.error("Error retrieving Stripe session:", error);
		return NextResponse.json(
			{ error: "Failed to retrieve session data" },
			{ status: 500 },
		);
	}
}
