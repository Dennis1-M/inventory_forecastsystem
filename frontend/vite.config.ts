import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
  },
  build: {
    // Generate source maps for better debugging
    sourcemap: true,
    // Ensure service worker is copied to dist
    rollupOptions: {
      input: {
        main: './index.html',
      }
    }
  }
})
