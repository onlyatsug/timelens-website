import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features/*': path.resolve(__dirname, './features/*'),
      '@/entities/*': path.resolve(__dirname, './entities/*'),
      '@/widgets/*': path.resolve(__dirname, './widgets/*'),
      '@/shared/*': path.resolve(__dirname, './shared/*'),
      '@/core/*': path.resolve(__dirname, './core/*'),
      '@/app/*': path.resolve(__dirname, './app/*')
    },
  },

  // Suportar imports "crus".
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
