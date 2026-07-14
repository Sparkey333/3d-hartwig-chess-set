import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { higgsfieldProxyPlugin } from './vite-plugins/higgsfieldProxy';

export default defineConfig({
  plugins: [react(), higgsfieldProxyPlugin()],
  // Relative base so the Mac .app can open the site over file://
  base: './',
  optimizeDeps: {
    exclude: ['stockfish.js'],
  },
  publicDir: 'public',
  server: {
    fs: { allow: ['.'] },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
