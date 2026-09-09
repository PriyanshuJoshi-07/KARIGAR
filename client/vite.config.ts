import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@shared": path.resolve(__dirname, "../shared")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [".monkeycode-ai.live"],
    fs: { allow: [".."] },
    proxy: {
      "/api": { target: "http://127.0.0.1:3001", changeOrigin: true },
      "/uploads": { target: "http://127.0.0.1:3001", changeOrigin: true }
    }
  },
  preview: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [".monkeycode-ai.live"]
  }
});
