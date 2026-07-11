/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}", // <--- ¡Esto debe coincidir con la ubicación real de tus archivos!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}