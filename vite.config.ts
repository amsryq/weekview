import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

const DEPLOY_PLATFORM = process.env.DEPLOY_PLATFORM || "cloudflare";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tailwindcss(),
		DEPLOY_PLATFORM === "cloudflare" &&
			cloudflare({ viteEnvironment: { name: "ssr" } }),
		DEPLOY_PLATFORM === "node" && nitro({ preset: "node-server" }),
		tanstackStart({
			prerender: {
				enabled: true,
			},
		}),
		viteReact(),
	].filter(Boolean),
	define: {
		"import.meta.env.VITE_COPYRIGHT_YEAR": JSON.stringify(
			new Date().getFullYear(),
		),
		"import.meta.env.DEPLOY_PLATFORM": JSON.stringify(DEPLOY_PLATFORM),
	},
	resolve: {
		tsconfigPaths: true,
	},
});
