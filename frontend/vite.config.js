// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  define: {
    global: 'globalThis',           // ← ESSENCIAL
    'process.env': {},              // ← ESSENCIAL
  },

  resolve: {
    alias: {
      // Polyfills manuais (sem plugin)
      process: 'process/browser',
      util: 'util',
      buffer: 'buffer',
    },
  },

  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1000,   // remove o warning amarelo do Vercel
    rollupOptions: {
      external: [
        // Todos os shims que o WalletConnect tenta importar
        'vite-plugin-node-polyfills/shims/process',
        'vite-plugin-node-polyfills/shims/global',
        'vite-plugin-node-polyfills/shims/buffer',
        '@walletconnect/window-metadata',
        '@walletconnect/window-getters',
      ],
    },
  },

  optimizeDeps: {
    include: ['buffer', 'process/browser'],
  },
})