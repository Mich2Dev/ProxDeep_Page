import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Demo build config: outputs to ../../proxdeep-dist at the project root
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../../proxdeep-dist',
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, 'index.demo.html'),
    },
  },
});
