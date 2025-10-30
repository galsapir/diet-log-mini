// ABOUTME: Vite build configuration for Diet Log Mini app
// ABOUTME: Includes GitHub Pages base path and Vitest test setup
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/diet-log-mini/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'happy-dom',
  },
})
