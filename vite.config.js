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
    open: 'https://nexa-ai-1-st64.onrender.com/', // Opens public URL directly
    proxy: {
      '/api': {
        target: 'https://nexa-ai-1-st64.onrender.com/', // Primary: Render
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.warn('\x1b[33m⚠️  Render Server unreachable, switching to Backup Localhost...\x1b[0m');
            // Failover to local backend
            proxy.web(req, res, { target: 'http://localhost:3001' });
          });
        },
      },
    },
  },
  plugins: [
    react(),
    {
      name: 'custom-terminal-output',
      configureServer(server) {
        const _print = server.printUrls;
        server.printUrls = () => {
          console.log('\n  \x1b[32m➜\x1b[0m  \x1b[1mLocal:\x1b[0m   \x1b[36mhttps://nexa-ai-1-st64.onrender.com/\x1b[0m');
          console.log('  \x1b[32m➜\x1b[0m  \x1b[1mNetwork:\x1b[0m \x1b[2muse --host to expose\x1b[0m\n');
        };
      }
    }
  ]
});