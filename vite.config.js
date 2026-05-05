import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load ALL env vars (no VITE_ prefix filter) — key stays server-side, never bundled
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Claude API proxy — key injected here, never sent to the browser
        "/api/claude": {
          target: "https://api.anthropic.com",
          changeOrigin: true,
          rewrite: () => "/v1/messages",
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.setHeader("x-api-key", env.ANTHROPIC_KEY || "");
              proxyReq.setHeader("anthropic-version", "2023-06-01");
              proxyReq.removeHeader("anthropic-dangerous-direct-browser");
            });
          },
        },
        // OCR.space proxy (existing)
        "/ocr-proxy": {
          target: "https://api.ocr.space",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ocr-proxy/, ""),
        },
      },
    },
  };
});
