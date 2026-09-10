import { Buffer } from 'buffer'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

;(globalThis as unknown as { Buffer: typeof Buffer }).Buffer = Buffer

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  server: {
    proxy: {
      '/api/pumpportal': {
        target: 'https://pumpportal.fun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pumpportal/, '/api'),
      },
      '/api/ollama': {
        target: 'http://127.0.0.1:11434',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ollama/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
})
