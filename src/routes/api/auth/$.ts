import { createFileRoute } from "@tanstack/react-router";
import { createAuth } from "~/server/auth";

export const Route = createFileRoute("/api/auth/$")({
    server: {
        handlers: {
            GET: async ({ request }: { request: Request }) => {
                const auth = createAuth();
                return await auth.handler(request);
            },
            POST: async ({ request }: { request: Request }) => {
                const auth = createAuth();
                return await auth.handler(request);
            },
        },
    },
});
