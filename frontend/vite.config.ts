import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { Buffer } from 'buffer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://sosiol.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [],
      output: {
        globals: {
          Buffer: 'Buffer',
        },
      },
    },
  },
});

