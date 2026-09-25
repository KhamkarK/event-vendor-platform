import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    // Docker Desktop on Windows doesn't forward native filesystem change
    // events across the bind-mount boundary, so Vite's default watcher never
    // sees host-side edits inside the container. Polling works around that.
    watch: {
      usePolling: true,
    },
  },
});
