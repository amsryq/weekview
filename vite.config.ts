import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	server: {
		port: 3000,
	},
	plugins: [
		tailwindcss(),
		cloudflare({ viteEnvironment: { name: "ssr" } }),
		tanstackStart({
			prerender: {
				enabled: true,
			},
		}),
		viteReact(),
	],
	define: {
		"import.meta.env.VITE_COPYRIGHT_YEAR": JSON.stringify(
			new Date().getFullYear(),
		),
	},
	resolve: {
		tsconfigPaths: true,
	},
});
