import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/auth": { target: "http://localhost:4001", changeOrigin: true },
      "/customers": { target: "http://localhost:4001", changeOrigin: true },
      "/loans": { target: "http://localhost:4001", changeOrigin: true },
      "/payments": { target: "http://localhost:4001", changeOrigin: true },
      "/dashboard": { target: "http://localhost:4001", changeOrigin: true },
      "/health": { target: "http://localhost:4001", changeOrigin: true },
    },
  },
  preview: {
    port: 4173,
    proxy: {
      "/auth": { target: "http://localhost:4001", changeOrigin: true },
      "/customers": { target: "http://localhost:4001", changeOrigin: true },
      "/loans": { target: "http://localhost:4001", changeOrigin: true },
      "/payments": { target: "http://localhost:4001", changeOrigin: true },
      "/dashboard": { target: "http://localhost:4001", changeOrigin: true },
      "/health": { target: "http://localhost:4001", changeOrigin: true },
    },
  },
});
