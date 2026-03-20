import { stripe } from "@better-auth/stripe";
import { getRequest } from "@tanstack/react-start/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/api";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { ENABLE_AUTH_PAYWALL_SERVER } from "./config/feature-flags";
import { createDb } from "./db";
import { handleCheckoutCompleted } from "./handlers/checkout";
import { createStripeClient } from "./stripe";

const IS_LOGGED_IN = "is_logged_in";

export function createAuth() {
	if (!ENABLE_AUTH_PAYWALL_SERVER) {
		throw new Error("Auth and paywall are disabled");
	}

	let req: Request;
	try {
		req = getRequest();
	} catch {
		req = new Request("http://localhost");
	}

	const db = createDb({
		DATABASE_URL: process.env.DATABASE_URL!,
		DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN!,
	});

	const plugins = [
		tanstackStartCookies(),
		stripe({
			stripeClient: createStripeClient(process.env.STRIPE_SECRET_KEY!),
			stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
			createCustomerOnSignUp: true,
			onEvent: async (event) => {
				const ctx = await auth.$context;
				switch (event.type) {
					case "checkout.session.completed": {
						await handleCheckoutCompleted(
							event.data.object,
							// biome-ignore lint/suspicious/noExplicitAny: complex BetterAuth context type
							ctx as unknown as any,
						);
						break;
					}
				}
			},
		}),
	];

	const auth = betterAuth({
		appName: "Weekview",
		basePath: "/api/auth",
		baseURL: new URL(req.url).origin,
		socialProviders: {
			google: {
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			},
			github: {
				clientId: process.env.GITHUB_CLIENT_ID!,
				clientSecret: process.env.GITHUB_CLIENT_SECRET!,
			},
		},
		hooks: {
			after: createAuthMiddleware(async (ctx) => {
				const setCookieStr = ctx.context.responseHeaders?.get("set-cookie");
				if (!setCookieStr) return;

				const { authCookies } = ctx.context;
				const loggedInCookie = ctx.context.createAuthCookie(IS_LOGGED_IN);

				if (
					setCookieStr.includes(`${authCookies.sessionToken.name}=;`) &&
					setCookieStr.includes(`${authCookies.sessionData.name}=;`) &&
					setCookieStr.includes("Max-Age=0")
				) {
					ctx.setCookie(loggedInCookie.name, "", {
						...loggedInCookie.attributes,
						maxAge: 0,
					});
				} else {
					const maxAgeMatch = setCookieStr.match(/Max-Age=(\d+)/);
					const maxAge = maxAgeMatch
						? Number.parseInt(maxAgeMatch[1], 10)
						: undefined;
					ctx.setCookie(loggedInCookie.name, "1", {
						...loggedInCookie.attributes,
						maxAge,
					});
				}
			}),
		},
		user: {
			additionalFields: {
				supporterUntil: {
					type: "date",
					input: false,
					required: false,
				},
				stripeCustomerId: {
					type: "string",
					input: false,
					required: false,
				},
			},
		},
		session: {
			storeSessionInDatabase: true,
		},
		database: drizzleAdapter(db, {
			provider: "sqlite",
			usePlural: true,
		}),
		plugins,
		advanced: {
			trustedProxyHeaders: true,
			ipAddress: { ipAddressHeaders: ["x-real-ip", "x-forwarded-for"] },
			cookiePrefix: "weekview-auth",
			useSecureCookies: true,
			cookies: {
				[IS_LOGGED_IN]: {
					attributes: {
						path: "/",
						httpOnly: false,
						sameSite: "lax",
					},
				},
			},
		},
		telemetry: {
			enabled: false,
		},
		secret: process.env.BETTER_AUTH_SECRET,
	});

	return auth;
}

/**
 * @deprecated
 * @internal
 * For CLI usage (schema generation) only. Do not use in runtime code.
 * Get instance from CF variables instead.
 */
export const auth = ENABLE_AUTH_PAYWALL_SERVER
	? (createAuth() as unknown)
	: null;
