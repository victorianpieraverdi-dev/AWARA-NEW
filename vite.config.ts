import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Only the production build is served from the /AWARA-NEW/ subpath
  // (GitHub Pages project site); dev/LAN stays at root.
  base: command === "build" ? "/AWARA-NEW/" : "/",
  build: {
    // Only build the Istok entry — the legacy root index.html is plain
    // vanilla JS (non-module scripts) and isn't meant to go through Vite.
    rollupOptions: {
      input: resolve(__dirname, "app/istok.html"),
    },
  },
  server: {
    // Open the new R3F entry screen ("Istok") by default.
    // The legacy vanilla stand is still available at /app/index.html
    open: "/app/istok.html",
    // Listen on all interfaces and allow tunneled hosts (e.g. ngrok),
    // so you can share a public demo link without "Blocked request" errors.
    host: true,
    allowedHosts: true,
    // Same-origin bridge to the AI proxy (port 8787): forge queue + generated
    // images. Lets the app on 5173 read Tigel-forged Daimon avatars without
    // cross-origin / CORS / Private-Network-Access problems.
    proxy: {
      "/api": "http://127.0.0.1:8787",
      "/avatars_generated": "http://127.0.0.1:8787",
      "/cards_generated": "http://127.0.0.1:8787",
    },
  },
}));
