import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ocr-proxy": {
        target: "https://api.ocr.space",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ocr-proxy/, ""),
      },
    },
  },
});
