/// <reference types="@cloudflare/workers-types" />
import type { StorageAdapter } from "@weekview/uitm-scraper";
import type { Storage } from "./types";

export class CloudflareStorage implements Storage {
	private kv: KVNamespace | undefined;

	constructor(kv: KVNamespace | undefined) {
		this.kv = kv;
	}

	async get(key: string): Promise<string | null> {
		if (!this.kv) return null;
		return this.kv.get(key);
	}

	async put(
		key: string,
		value: string,
		options?: { expiration?: number; expirationTtl?: number },
	): Promise<void> {
		if (!this.kv) return;
		return this.kv.put(key, value, options);
	}

	async delete(key: string): Promise<void> {
		if (!this.kv) return;
		return this.kv.delete(key);
	}

	async list(options?: {
		prefix?: string;
		limit?: number;
		cursor?: string;
	}): Promise<{
		keys: { name: string }[];
		list_complete: boolean;
		cursor?: string;
	}> {
		if (!this.kv) return { keys: [], list_complete: true };
		return this.kv.list(options);
	}

	asStorageAdapter(): StorageAdapter {
		return {
			get: this.get.bind(this),
			set: async (key, value, ttlSeconds) => {
				await this.put(key, value, { expirationTtl: ttlSeconds });
			},
			delete: this.delete.bind(this),
		};
	}
}
