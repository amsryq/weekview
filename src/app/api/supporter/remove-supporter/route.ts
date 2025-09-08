import { NextRequest } from "next/server";
import { auth } from "~/lib/auth";

export async function POST(request: NextRequest) {
	try {
		const ctx = await auth.$context;
		const session = await auth.api.getSession(request);

		if (!session?.user) {
			return new Response("Unauthorized", { status: 401 });
		}

		if (session.user.supporterUntil == null) {
			return new Response("User is not a supporter", { status: 400 });
		}

		await ctx.adapter.update({
			model: "user",
			where: [{ field: "id", value: session.user.id }],
			update: {
				supporterUntil: null,
			},
		});

		return new Response("Supporter status removed", { status: 200 });
	} catch (error) {
		console.error("Error removing supporter status:", error);
		return new Response("Internal Server Error", { status: 500 });
	}
}
