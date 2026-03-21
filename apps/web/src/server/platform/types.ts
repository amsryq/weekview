import { StorageAdapter } from "@weekview/uitm-scraper";

export interface Storage {
	get(key: string): Promise<string | null>;
	put(
		key: string,
		value: string,
		options?: { expiration?: number; expirationTtl?: number },
	): Promise<void>;
	delete(key: string): Promise<void>;
	list(options?: {
		prefix?: string;
		limit?: number;
		cursor?: string;
	}): Promise<{
		keys: { name: string }[];
		list_complete: boolean;
		cursor?: string;
	}>;
	asStorageAdapter(): StorageAdapter;
}

export interface PlatformContext {
	env: CloudflareEnv;
	cf?: IncomingRequestCfProperties;
	ctx?: ExecutionContext;
}

export interface CloudflareEnv {
	KV?: KVNamespace;
	WEEKVIEW_ENABLE_AUTH_PAYWALL?: string;
	APP_URL: string;
	CACHE_CLEAR_TOKEN: string;
	SUPPORTER_ONE_TIME_PRICE_ID: string;
	TRUSTED_ORIGINS: string;
	ROOT_REDIRECTS: string;
	// Add other bindings here
	DATABASE_URL: string;
	DATABASE_AUTH_TOKEN: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	GOOGLE_CLIENT_ID: string;
	GOOGLE_CLIENT_SECRET: string;
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
	STRIPE_SECRET_KEY: string;
	STRIPE_WEBHOOK_SECRET: string;
	BACKEND_URL: string;
}

export type Platform = "cloudflare" | "node";
