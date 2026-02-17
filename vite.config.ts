import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    server: {
        port: 3000,
    },
    plugins: [
        tanstackStart({ spa: { enabled: true } }),
        nitro(),
        tsConfigPaths({
            projects: ["./tsconfig.json"],
        }),
        tailwindcss(),
        viteReact(), // Keep viteReact as it was in the original and not removed by the instruction
    ],
});
