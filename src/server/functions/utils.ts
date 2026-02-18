import { CloudflareStorage } from "../platform/cloudflare";
import { CloudflareEnv, Storage } from "../platform/types";

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