import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    exclude: ['stockfish.js'],
  },
  publicDir: 'public',
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api/ai': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
    proxy: {
      '/api/ai': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
      },
    },
  },
});
