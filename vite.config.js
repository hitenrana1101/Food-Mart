// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '127.0.0.1', // optional: keep local only
    port: 5173,        // default vite port
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        // DO NOT rewrite for your setup; backend expects /api prefix
        // rewrite: (p) => p, 
        configure: (proxy) => {
          // Minimal logs to verify routing during dev
          proxy.on('proxyReq', (_pReq, req) => {
            console.log('[proxy] ->', req.method, req.url)
          })
          proxy.on('proxyRes', (pRes, req) => {
            console.log('[proxy] <-', pRes.statusCode, req.method, req.url)
          })
          proxy.on('error', (err, _req, _res) => {
            console.error('[proxy:error]', err.message)
          })
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },  
})
