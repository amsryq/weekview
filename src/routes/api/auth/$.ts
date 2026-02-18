import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "~/server/auth";
import { getEnv } from "~/server/platform/env";

export const Route = createFileRoute("/api/auth/$")({
    server: {
        handlers: {
            GET: async ({ request }: { request: Request }) => {
                const env = getEnv();
                const auth = createAuth(env);
                return await auth.handler(request);
            },
            POST: async ({ request }: { request: Request }) => {
                const env = getEnv();
                const auth = createAuth(env);
                return await auth.handler(request);
            },
        },
    },
});
