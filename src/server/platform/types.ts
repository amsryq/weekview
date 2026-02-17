export interface Storage {
    get(key: string): Promise<string | null>;
    put(
        key: string,
        value: string,
        options?: { expiration?: number; expirationTtl?: number },
    ): Promise<void>;
    delete(key: string): Promise<void>;
    list(
        options?: { prefix?: string; limit?: number; cursor?: string },
    ): Promise<{ keys: { name: string }[]; list_complete: boolean; cursor?: string }>;
}

export interface PlatformContext {
    env: CloudflareEnv;
    cf?: IncomingRequestCfProperties;
    ctx?: ExecutionContext;
}

export interface CloudflareEnv {
    KV?: KVNamespace;
    APP_URL: string;
    CACHE_CLEAR_TOKEN: string;
    SUPPORTER_ONE_TIME_PRICE_ID: string;
    TRUSTED_ORIGINS: string;
    ROOT_REDIRECTS: string;
    // Add other bindings here
}

export type Platform = "cloudflare" | "node";
