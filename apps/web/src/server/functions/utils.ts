import { StorageAdapter } from "@weekview/uitm-scraper";
import { Storage } from "../platform/types";

export function getInMemoryStorage(): Storage {
	const storage = new Map<string, { value: string; expires?: number }>();

	const isExpired = (expires?: number) =>
		expires !== undefined && Date.now() > expires;

	const get: Storage["get"] = async (key: string) => {
		const entry = storage.get(key);
		if (!entry) return null;
		if (isExpired(entry.expires)) {
			storage.delete(key);
			return null;
		}
		return entry.value;
	};

	const put: Storage["put"] = async (
		key: string,
		value: string,
		options?: { expiration?: number; expirationTtl?: number },
	) => {
		let expires: number | undefined;
		if (options?.expiration) {
			expires = options.expiration * 1000;
		} else if (options?.expirationTtl) {
			expires = Date.now() + options.expirationTtl * 1000;
		}
		storage.set(key, { value, expires });
	};

	const del: Storage["delete"] = async (key: string) => {
		storage.delete(key);
	};

	const list: Storage["list"] = async (options?: {
		prefix?: string;
		limit?: number;
		cursor?: string;
	}) => {
		const prefix = options?.prefix ?? "";
		const limit = options?.limit ?? 1000;
		const cursor = options?.cursor ? parseInt(atob(options.cursor), 10) : 0;

		// Cleanup expired and filter by prefix
		const allKeys = Array.from(storage.entries())
			.filter(([key, entry]) => {
				if (isExpired(entry.expires)) {
					storage.delete(key);
					return false;
				}
				return key.startsWith(prefix);
			})
			.map(([key]) => key)
			.sort();

		const paginatedKeys = allKeys.slice(cursor, cursor + limit);
		const nextCursor =
			cursor + limit < allKeys.length
				? btoa((cursor + limit).toString())
				: undefined;

		return {
			keys: paginatedKeys.map((key) => ({ name: key })),
			list_complete: nextCursor === undefined,
			cursor: nextCursor,
		};
	};

	return {
		get,
		put,
		delete: del,
		list,
		asStorageAdapter: function (): StorageAdapter {
			return {
				get: (key) => get(key),
				set: async (key, value, cacheTTL) => {
					await put(key, value, { expirationTtl: cacheTTL });
				},
				delete: (key) => del(key),
			};
		},
	};
}
