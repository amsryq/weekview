import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";
import { stripeClient } from "~/lib/stripe";

export async function GET(request: NextRequest) {
	try {
		const authSession = await auth.api.getSession(request);
		const customerId = authSession?.user.stripeCustomerId;
		if (!customerId) {
			return new Response("No Stripe customer linked to user", { status: 400 });
		}

		const session = await stripeClient.checkout.sessions.create({
			mode: "payment",
			customer: customerId,
			line_items: [
				{
					price: "price_1S54itLDjUFZoEniMf5ze0P8",
					quantity: 1,
				},
			],
			metadata: {
				type: "supporter_payment",
			},
			success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-cancel`,
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Error generating supporter checkout session:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
