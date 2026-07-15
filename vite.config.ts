import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
});
