import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import tailwindcss from '@tailwindcss/vite';
import process from 'process';
import dotenv from 'dotenv';
import path from 'path';

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
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        configure: (proxy, _options) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          proxy.on('proxyReq', (proxyReq, _req, _res, _options) => {
            if (process.env.VITE_BLOCKFROST_PROJECT_ID) {
              proxyReq.setHeader(
                'project_id',
                process.env.VITE_BLOCKFROST_PROJECT_ID,
              );
            }
          });
        },
        rewrite: (path) => path.replace(/^\/betterfrost/, ''),
      },

      '/registry-proxy': {
        target: process.env.VITE_REGISTRY_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/registry-proxy/, ''),
      },

      // optional ogmios service
      ...(process.env.VITE_OGMIOS_URL && process.env.VITE_OGMIOS_URL !== 'null'
        ? {
            '/ogmios': {
              target: process.env.VITE_OGMIOS_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/ogmios/, ''),
            },
          }
        : {}),

      // optional paste.super.fish paste service
      ...(process.env.VITE_SF_URL && process.env.VITE_SF_URL !== 'null'
        ? {
            '/paste/sf': {
              target: process.env.VITE_SF_URL,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/paste\/sf/, ''),
            },
          }
        : {}),
    },

    host: '0.0.0.0',
  },
});
