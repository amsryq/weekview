import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "~/server/auth";
import { ENABLE_AUTH_PAYWALL_SERVER } from "~/server/config/feature-flags";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: async ({ request }: { request: Request }) => {
				if (!ENABLE_AUTH_PAYWALL_SERVER) {
					return new Response("Not Found", { status: 404 });
				}

				const auth = createAuth();
				return await auth.handler(request);
			},
			POST: async ({ request }: { request: Request }) => {
				if (!ENABLE_AUTH_PAYWALL_SERVER) {
					return new Response("Not Found", { status: 404 });
				}

				const auth = createAuth();
				return await auth.handler(request);
			},
		},
	},
});
