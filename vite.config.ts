import { defineConfig, loadEnv } from "vite";

import dotenv from "dotenv";
import path from "path";
import react from "@vitejs/plugin-react";

// Load .env file
dotenv.config();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    define: {
      "process.env.GOOGLE_API_KEY": JSON.stringify(env.VITE_GOOGLE_API_KEY),
      "process.env.GOOGLE_CLIENT_ID": JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      "process.env.GOOGLE_SPREADSHEET_ID": JSON.stringify(
        env.VITE_GOOGLE_SPREADSHEET_ID
      ),
    },
    plugins: [react()],
    build: {
      sourcemap: true,
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "unsafe-none", // "same-origin-allow-popups",
        "Cross-Origin-Embedder-Policy": "unsafe-none", // "require-corp",
      },
      host: "localhost",
      port: 5173,
    },
  };
});
