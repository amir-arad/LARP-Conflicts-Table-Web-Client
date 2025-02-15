import { defineConfig, loadEnv } from "vite";

import dotenv from "dotenv";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

dotenv.config();

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "./",
    define: {
      "process.env.GOOGLE_API_KEY": JSON.stringify(env.VITE_GOOGLE_API_KEY),
      "process.env.GOOGLE_CLIENT_ID": JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      "process.env.GOOGLE_SPREADSHEET_ID": JSON.stringify(
        env.VITE_GOOGLE_SPREADSHEET_ID
      ),
    },
    plugins: [react(), tailwindcss()],
    test: {
      environment: "jsdom",
      globals: true,
    },
    build: {
      sourcemap: true,
    },

    server: {
      headers: {
        "Cross-Origin-Opener-Policy": "unsafe-none",
        "Cross-Origin-Embedder-Policy": "unsafe-none",
      },
      host: "localhost",
      port: 5173,
    },
  };
});
