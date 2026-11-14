import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { OutputBundle } from "rollup";

const removePureAnnotations = () => ({
  name: "remove-pure-annotations",
  generateBundle(_options: unknown, bundle: OutputBundle) {
    for (const output of Object.values(bundle)) {
      if (output.type === "chunk" && output.code) {
        output.code = output.code.replace(/\/\* @__PURE__ \*\/\s*/g, "");
      }
    }
  }
});

export default defineConfig(({ mode }) => ({
  plugins: [react(), removePureAnnotations()],
  build: {
    minify: mode === "production",
    cssMinify: mode === "production",
    sourcemap: mode !== "production",
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        entryFileNames: "assets/app.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name][extname]",
        compact: false,
        preserveModules: false,
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
  esbuild: {
    legalComments: "inline",
  },
}));
