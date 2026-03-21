import { Storage } from "../platform/types";

export interface CacheService {
	get<T>(key: string): Promise<T | null>;
	set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
}

export class StorageCacheService implements CacheService {
	private storage: Storage;

	constructor(storage: Storage) {
		this.storage = storage;
	}

	async get<T>(key: string): Promise<T | null> {
		try {
			const val = await this.storage.get(key);
			if (!val) return null;
			return JSON.parse(val) as T;
		} catch (error) {
			console.error(`Cache get error for key "${key}":`, error);
			return null;
		}
	}

	async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
		try {
			await this.storage.put(key, JSON.stringify(value), {
				expirationTtl: ttlSeconds,
			});
		} catch (error) {
			console.error(`Cache set error for key "${key}":`, error);
		}
	}

	async delete(key: string): Promise<void> {
		try {
			await this.storage.delete(key);
		} catch (error) {
			console.error(`Cache delete error for key "${key}":`, error);
		}
	}

	async clear(): Promise<void> {
		// No-op for KV based storage as it's expensive to clear all
		console.warn("StorageCacheService.clear() not implemented");
	}
}

export function createCacheService(storage: Storage): CacheService {
	return new StorageCacheService(storage);
}

const version = import.meta.env.DEV ? Math.floor(Math.random() * 100000) : "v1";

// Cache key generators for consistency
export const CacheKeys = {
	uitm: {
		tokens: (path: string) =>
			`uitm:tokens:${version}:${Buffer.from(path).toString("base64")}`,
		courses: (campus: string, faculty?: string) =>
			`uitm:courses:${version}:${campus}${faculty ? `:${faculty}` : ""}`,
		timetable: (path: string) =>
			`uitm:timetable:${version}:${Buffer.from(path).toString("base64")}`,
		cookies: (identifier: string) => `uitm:cookies:${version}:${identifier}`,
	},
} as const;
