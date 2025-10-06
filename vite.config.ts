import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/resend": {
        target: "https://api.resend.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/resend/, ""),
        headers: {
          Origin: "https://api.resend.com",
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
