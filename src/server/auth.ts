import { betterAuth } from "better-auth";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createAuthMiddleware } from "better-auth/plugins";
import { cloudflare } from "better-auth-cloudflare";
import { stripe } from "@better-auth/stripe";
import { createDb } from "./db";
import { CloudflareEnv } from "./platform/types";
import { createStripeClient } from "./stripe";
import { handleCheckoutCompleted } from "./handlers/checkout";

const IS_LOGGED_IN = "is_logged_in";

export function createAuth(env: CloudflareEnv, cf?: IncomingRequestCfProperties) {
    const db = createDb({
        DATABASE_URL: env.DATABASE_URL,
        DATABASE_AUTH_TOKEN: env.DATABASE_AUTH_TOKEN,
    });

    const auth = betterAuth({
        appName: "Weekview",
        basePath: "/api/auth",
        baseURL: env.BETTER_AUTH_URL || env.APP_URL + "/api/auth",
        trustedOrigins: env.TRUSTED_ORIGINS?.split(","),
        socialProviders: {
            google: {
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET,
            },
            github: {
                clientId: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
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
                stripeClient: createStripeClient(env),
                stripeWebhookSecret: env.STRIPE_WEBHOOK_SECRET,
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
        secret: env.BETTER_AUTH_SECRET,
    });

    return auth;
}
