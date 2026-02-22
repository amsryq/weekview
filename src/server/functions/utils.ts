import { Storage } from "../platform/types";

// TODO: Wire up Cloudflare KV binding when ready (see src/server/platform/cloudflare.ts)
export function getStorage(): Storage {
	const storage = new Map<string, any>();
	return {
		get: async (key: string) => storage.get(key) ?? null,
		put: async (key: string, value: any) => {
			storage.set(key, value);
		},
		delete: async (key: string) => {
			storage.delete(key);
		},
		list: async () => {
			return {
				keys: Array.from(storage.keys()).map((key) => ({ name: key })),
				list_complete: true,
			};
		},
	};
}
