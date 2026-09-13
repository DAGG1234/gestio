import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'gestio.png'],
      manifest: {
        name: 'Gestio',
        short_name: 'Gestio',
        description: 'Tu gestor financiero personal offline-first',
        theme_color: '#0b4d6c',
        background_color: '#073044',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/gestio.png',
            sizes: '512x512', // Es recomendable especificar un tamaño estándar o 'any'
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      // Mapea la ruta `@/` directamente a la carpeta `src`
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})