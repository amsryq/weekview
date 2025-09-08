import { NextRequest, NextResponse } from "next/server";
import { auth } from "~/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession(request);
		if (!session) {
			return NextResponse.json(null, { status: 401 });
		}

		return NextResponse.json({
			user: {
				id: session.user.id,
				name: session.user.name,
				email: session.user.email,
				supporterUntil: session.user.supporterUntil,
				stripeCustomerId: session.user.stripeCustomerId,
			},
		});
	} catch (error) {
		console.error("Error fetching session:", error);
		return NextResponse.json(
			{ error: "Failed to fetch session" },
			{ status: 500 },
		);
	}
}
