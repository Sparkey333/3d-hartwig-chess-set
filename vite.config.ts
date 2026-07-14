import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so the Mac .app can open the site over file://
  base: './',
  optimizeDeps: {
    exclude: ['stockfish.js'],
  },
  publicDir: 'public',
});
