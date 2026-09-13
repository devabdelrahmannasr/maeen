import preact from '@preact/preset-vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  plugins: [preact()],
  server: {
    watch: {
      ignored: ['**/output/**', '**/.playwright-cli/**'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome114',
    rollupOptions: {
      input: 'sidepanel.html',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
});
