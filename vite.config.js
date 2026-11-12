import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  esbuild: { jsx: "automatic" },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react-router-dom") ||
              id.includes("react-dom") ||
              id.includes("/react/")
            ) {
              return "vendor-react";
            }
            if (id.includes("motion")) {
              return "vendor-motion";
            }
            if (id.includes("lucide-react")) {
              return "vendor-lucide";
            }
            if (id.includes("@supabase")) {
              return "vendor-supabase";
            }
          }
        },
      },
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
