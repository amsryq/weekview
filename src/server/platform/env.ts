import { CloudflareEnv } from "./types";

export function getEnv(): CloudflareEnv {
    const env = (process.env as unknown as CloudflareEnv);
    return env;
}
