import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gestio - Finanzas Personales',
        short_name: 'Gestio',
        description: 'Gestor financiero personal',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/logo-gestio.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/logo-gestio.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Esto asegura que tu app guarde los archivos necesarios para cargar offline
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    }),
  ],
})