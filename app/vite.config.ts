/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "build" // CRA's default build output
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 3000
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [fileURLToPath(new URL("./src/setupTests.ts", import.meta.url))]
  }
});
