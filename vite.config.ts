import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite' // Asegúrate de que esta línea exista

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],
})