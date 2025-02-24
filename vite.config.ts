import { defineConfig, loadEnv, UserConfig, ConfigEnv } from 'vite';
import dotenv from 'dotenv';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import 'vitest/node';

dotenv.config();

export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, import.meta.dirname, '');

  return {
    base: './',
    define: {
      'process.env.GOOGLE_API_KEY': JSON.stringify(env.VITE_GOOGLE_API_KEY),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
      'process.env.GOOGLE_SPREADSHEET_ID': JSON.stringify(
        env.VITE_GOOGLE_SPREADSHEET_ID
      ),
    },
    plugins: [react(), tailwindcss()],
    test: {
      environment: 'jsdom',
      globals: true,
    },
    build: {
      sourcemap: true,
    },

    server: {
      headers: {
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
      },
      host: 'localhost',
      port: 5173,
    },
  } satisfies UserConfig;
});
