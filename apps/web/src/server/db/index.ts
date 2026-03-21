import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./auth.schema";

export * from "./auth.schema";

export function createDb(env: {
	DATABASE_URL: string;
	DATABASE_AUTH_TOKEN: string;
}) {
	const client = createClient({
		url: env.DATABASE_URL,
		authToken: env.DATABASE_AUTH_TOKEN,
	});
	return drizzle(client, { schema });
}
