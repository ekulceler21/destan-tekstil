import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        katalog: resolve(__dirname, 'katalog.html'),
        urun: resolve(__dirname, 'urun.html'),
        sepet: resolve(__dirname, 'sepet.html'),
        tesekkurler: resolve(__dirname, 'tesekkurler.html'),
      },
    },
  },
});
