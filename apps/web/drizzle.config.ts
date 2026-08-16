import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV === "production") {
	dotenv.config({
		path: ".dev.vars.production",
	});
}

export default defineConfig({
	dialect: "turso",
	schema: "./src/server/db/index.ts",
	out: "./drizzle",
	dbCredentials: {
		url: process.env.DATABASE_URL!,
		authToken: process.env.DATABASE_AUTH_TOKEN,
	},
});
