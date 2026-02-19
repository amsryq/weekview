import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/plugins";
import { cloudflare } from "better-auth-cloudflare";
import { stripe } from "@better-auth/stripe";
import { createDb } from "./db";
import { createStripeClient } from "./stripe";
import { handleCheckoutCompleted } from "./handlers/checkout";
import { getRequest } from "@tanstack/react-start/server";

const IS_LOGGED_IN = "is_logged_in";

export function createAuth(cf?: IncomingRequestCfProperties) {
    try {
        var req = getRequest();
    } catch {
        var req = new Request("http://localhost");
    }

    const db = createDb({
        DATABASE_URL: process.env.DATABASE_URL!,
        DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN!,
    });

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
        plugins: [
            tanstackStartCookies(),
            cloudflare({
                cf,
                autoDetectIpAddress: true,
                geolocationTracking: true,
            }),
            stripe({
                stripeClient: createStripeClient(process.env.STRIPE_SECRET_KEY!),
                stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
                createCustomerOnSignUp: true,
                onEvent: async (event) => {
                    const ctx = await auth.$context;
                    switch (event.type) {
                        case "checkout.session.completed": {
                            await handleCheckoutCompleted(event.data.object, ctx);
                            break;
                        }
                    }
                },
            }),
        ],
        advanced: {
            ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-real-ip"] },
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
export const auth = createAuth() as unknown;