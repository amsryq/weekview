import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

const vars = {
	COPYRIGHT_YEAR: new Date().getFullYear(),
	WEEKVIEW_ENABLE_AUTH_PAYWALL:
		process.env.WEEKVIEW_ENABLE_AUTH_PAYWALL === "true",
};

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tailwindcss(),
		tsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({
			prerender: {
				enabled: true,
			},
		}),
		viteReact(),
	],
	define: Object.fromEntries(
		Object.entries(vars).map(([key, value]) => [
			"import.meta.env." + key,
			JSON.stringify(value),
		]),
	),
});
