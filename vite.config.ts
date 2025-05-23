import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import tailwindcss from '@tailwindcss/vite';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

for (const k of ['VITE_BETTERFROST_URL']) {
  if (!process.env[k]) {
    throw new Error(`Missing environment variable: ${k}`);
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', {}]],
      },
    }),
    tailwindcss(),
  ],
  build: {
    target: 'esnext',
  },
  server: {
    watch: {
      ignored: ['**/.direnv/**'],
    },
    cors: true,
    proxy: {
      '/betterfrost': {
        target: process.env.VITE_BETTERFROST_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/betterfrost/, ''),
      },

      '/registry-proxy': {
        target: process.env.VITE_REGISTRY_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/registry-proxy/, ''),
      },
      ...(process.env.VITE_OGMIOS_URL && process.env.VITE_OGMIOS_URL !== 'null'
        ? {
            '/ogmios': {
              target: process.env.VITE_OGMIOS_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/ogmios/, ''),
            },
          }
        : {}),
    },

    host: '0.0.0.0',
  },
});
