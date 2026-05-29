import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['www.proxdeep.com', 'proxdeep.com'],
    host: true,
    port: 5173,
    watch: {
      usePolling: true
    }
  }
});
