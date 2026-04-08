import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  logLevel: 'info', // Show server status and links in console
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src (forntend)"),
    },
  },
  server: {
    host: true, // Listens on all local IPs
    open: true,
    proxy: {
      '/api': {
        // target: 'https://nexa-ai-1-st64.onrender.com/', // Production
        target: 'https://nexa-ai-1-st64.onrender.com/', // Production URL
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [
    react(),
  ]
});