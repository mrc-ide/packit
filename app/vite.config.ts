/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import tailwind from "tailwindcss";
import autoprefixer from "autoprefixer";
import { configDefaults } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  assetsInclude: ["**/*.md"],
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()]
    }
  },
  build: {
    outDir: "build"
  },
  resolve: {
    alias: {
      "@components": fileURLToPath(new URL("./src/app/components", import.meta.url)),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@config": fileURLToPath(new URL("./src/config", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 3000
  },
  optimizeDeps: {
    exclude: ["chromium-bidi"]
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [fileURLToPath(new URL("./src/setupTests.ts", import.meta.url))],
    exclude: [...configDefaults.exclude, "e2e/*"],
    coverage: {
      provider: "v8",
      include: ["src/app/**/*", "src/lib/**/*", "src/config/**/*"],
      exclude: ["src/app/components/Base/*", "src/app/components/routes/Router.tsx"]
    }
  }
});
