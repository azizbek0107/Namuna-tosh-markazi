import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: { jsx: "automatic" },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // This is a browser-only SPA; dependency RSC directives have no meaning here.
        // Keep every other Rollup warning visible.
        if (
          warning.code === "MODULE_LEVEL_DIRECTIVE" &&
          warning.message.includes('"use client"') &&
          warning.id?.includes("node_modules")
        )
          return;
        warn(warning);
      },
    },
  },
});
