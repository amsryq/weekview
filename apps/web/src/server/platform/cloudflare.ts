/// <reference types="@cloudflare/workers-types" />
import type { StorageAdapter } from "@weekview/uitm-scraper";

const D1_STORAGE_TABLE = "uitm_storage";

export class CloudflareD1Storage implements StorageAdapter {
	private readonly database: D1Database;
	private ready: Promise<void> | undefined;

	constructor(database: D1Database) {
		this.database = database;
	}

	private async ensureReady(): Promise<void> {
		this.ready ??= this.database
			.prepare(
				`CREATE TABLE IF NOT EXISTS ${D1_STORAGE_TABLE} (
					key TEXT PRIMARY KEY NOT NULL,
					value TEXT NOT NULL,
					expires_at INTEGER
				)`,
			)
			.run()
			.then(() => undefined);

		await this.ready;
	}

	async get(key: string): Promise<string | null> {
		await this.ensureReady();
		const entry = await this.database
			.prepare(
				`SELECT value, expires_at
				 FROM ${D1_STORAGE_TABLE}
				 WHERE key = ?1`,
			)
			.bind(key)
			.first<{ value: string; expires_at: number | null }>();

		if (!entry) return null;
		if (entry.expires_at !== null && entry.expires_at <= Date.now()) {
			await this.delete(key);
			return null;
		}
		return entry.value;
	}

	async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
		await this.ensureReady();
		const expiresAt =
			ttlSeconds === undefined ? null : Date.now() + ttlSeconds * 1000;

		await this.database
			.prepare(
				`INSERT INTO ${D1_STORAGE_TABLE} (key, value, expires_at)
				 VALUES (?1, ?2, ?3)
				 ON CONFLICT(key) DO UPDATE SET
					value = excluded.value,
					expires_at = excluded.expires_at`,
			)
			.bind(key, value, expiresAt)
			.run();
	}

	async delete(key: string): Promise<void> {
		await this.ensureReady();
		await this.database
			.prepare(`DELETE FROM ${D1_STORAGE_TABLE} WHERE key = ?1`)
			.bind(key)
			.run();
	}
}
