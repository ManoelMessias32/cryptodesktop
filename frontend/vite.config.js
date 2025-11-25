import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // <<< ADICIONADO PARA CORRIGIR CAMINHOS NO DEPLOY
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1600, // Aumenta o limite para 1600 kB
  },
});
