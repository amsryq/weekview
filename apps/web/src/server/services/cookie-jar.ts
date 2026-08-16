import { CookieJar } from "tough-cookie";
import { CacheKeys, type CacheService } from "./cache";

export interface CookieJarService {
	getCookieJar(): Promise<CookieJar>;
	saveCookieJar(jar: CookieJar): Promise<void>;
	clear(): Promise<void>;
}

function isCallable(cause: unknown): cause is () => number {
	return (
		Object.prototype.toString.call(cause) === "[object Function]" ||
		Object.prototype.toString.call(cause) === "[object AsyncFunction]"
	);
}

export class CachedCookieJarService implements CookieJarService {
	private memoryJar: CookieJar | null = null;
	private cache: CacheService;
	private cacheKey: string;
	private ttlSeconds: number;

	constructor(
		cache: CacheService,
		cacheKey: string,
		ttlSeconds = 600, // Default 10 minutes
	) {
		this.cache = cache;
		this.cacheKey = cacheKey;
		this.ttlSeconds = ttlSeconds;
	}

	async getCookieJar(): Promise<CookieJar> {
		// Return memory jar if available (for same request)
		if (this.memoryJar) {
			return this.memoryJar;
		}

		try {
			// Try to load from cache
			const cached = await this.cache.get<string>(this.cacheKey);
			if (cached) {
				const jar = CookieJar.fromJSON(cached);
				this.memoryJar = jar;
				return jar;
			}
		} catch (error) {
			console.error("Failed to load cookie jar from cache:", error);
		}

		// Create new jar if not found
		const jar = new CookieJar();
		this.memoryJar = jar;
		return jar;
	}

	async saveCookieJar(jar: CookieJar): Promise<void> {
		try {
			this.memoryJar = jar;
			const serialized = jar.toJSON();

			// Calculate TTL based on cookie expiration
			let minTtl = this.ttlSeconds;
			const cookies = await jar.getCookies("https://simsweb4.uitm.edu.my");

			if (cookies.length > 0) {
				const now = Date.now();
				for (const cookie of cookies) {
					if (isCallable(cookie.expiryTime)) {
						const expiryTime = cookie.expiryTime();
						if (expiryTime && expiryTime !== Number.POSITIVE_INFINITY) {
							const ttl = Math.floor((expiryTime - now) / 1000);
							if (ttl > 0 && ttl < minTtl) {
								minTtl = ttl;
							}
						}
					}
				}
			}

			// Cap minimum TTL at 60 seconds and maximum at configured TTL
			minTtl = Math.max(60, Math.min(minTtl, this.ttlSeconds));

			await this.cache.set(this.cacheKey, JSON.stringify(serialized), minTtl);
		} catch (error) {
			console.error("Failed to save cookie jar to cache:", error);
		}
	}

	async clear(): Promise<void> {
		this.memoryJar = null;
		await this.cache.delete(this.cacheKey);
	}
}

export function createCookieJarService(
	cache: CacheService,
	identifier = "default",
	ttlSeconds = 600,
): CookieJarService {
	const cacheKey = CacheKeys.uitm.cookies(identifier);
	return new CachedCookieJarService(cache, cacheKey, ttlSeconds);
}
