// vite.config.js — VERSÃO NUCLEAR (funciona com qualquer coisa)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': process.env,
  },
  resolve: {
    alias: {
      process: 'process/browser',
      buffer: 'buffer',
      util: 'util'
    }
  },
  build: {
    rollupOptions: {
      external: (id) => {
        return id.includes('node-polyfills') ||
               id.includes('walletconnect') ||
               id.includes('process') ||
               id.includes('buffer')
      }
    },
    target: 'es2022',
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['buffer', 'process']
  }
})