import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
export default defineConfig({
    envDir: fileURLToPath(new URL("../../", import.meta.url)),
    plugins: [react()],
    resolve: {
        alias: {
            "@rubiks/shared": fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url))
        }
    },
    server: {
        port: 5173
    },
    test: {
        globals: true,
        setupFiles: "./src/test/setup.ts",
        environment: "jsdom"
    }
});
