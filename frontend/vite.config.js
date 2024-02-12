import { defineConfig } from 'vite';
import { resolve } from 'path'


export default defineConfig({
  build: {
    assetsDir: './',
    outDir: '../dist',
    emptyOutDir: '../dist'
  }
});
