// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: [
        '@walletconnect/window-metadata',
        '@walletconnect/window-getters'
      ]
    },
    commonjsOptions: {
      exclude: ['@walletconnect/window-metadata', '@walletconnect/window-getters']
    }
  },
  define: {
    global: 'globalThis', // ajuda em alguns casos
  }
})