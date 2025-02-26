import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@types": "/src/types",
      "@components": "/src/components",
      "@core": "/src/core",
    },
  },
  build: {
    outDir: "build",
    rollupOptions: {
      input: {
        main: "./index.html",
        content: "./src/core/content.ts",
        background: "./src/core/background.ts",
        popup: "./src/core/popup.ts",
      },
      output: {
        entryFileNames: `assets/scripts/[name].js`,
        chunkFileNames: `assets/scripts/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
