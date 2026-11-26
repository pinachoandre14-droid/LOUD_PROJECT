import { defineConfig } from 'vite';

export default defineConfig({
  base: '/LOUD_PROJECT/',
  build: { target: 'es2022' }, // top-level await in main.js
  server: {
    // Rhino keeps its files locked while saving; watching them crashes the dev server on Windows.
    watch: { ignored: ['**/*.3dm', '**/*.3dmbak', '**/*.rhl', '**/reference/**', '**/rhino/**'] },
  },
});
