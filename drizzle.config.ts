/// <reference types="@types/node" />
import { defineConfig } from "drizzle-kit";

if (process.env.NODE_ENV === "production") {
	// biome-ignore lint/style/noCommonJs: This file is not to be tree-shaken and is on top-level
	require("dotenv").config({
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
