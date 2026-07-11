import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    // Datos del usuario
    nombre: 'Daniel Gonzalez',
    correo: 'daniel19gg@email.com',
    
    // Estado del modo oscuro (iniciado desde localStorage)
    isDarkMode: localStorage.getItem('darkMode') === 'true',
  }),

  actions: {
    // Alternar tema y guardar preferencia
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode.toString());
      
      // Aplicar al documento raíz para que Tailwind aplique los estilos 'dark:'
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    // Lógica para cambiar contraseña
    cambiarPassword(passAnterior: string, passNueva: string) {
      if (!passAnterior || !passNueva) {
        alert("Por favor rellena ambos campos.");
        return;
      }
      // Aquí iría tu llamada a la API o lógica de validación
      console.log("Cambiando contraseña de:", passAnterior, "a:", passNueva);
      alert("Contraseña actualizada exitosamente.");
    },

    // Cerrar sesión
    cerrarSesion() {
      // Limpieza de datos
      localStorage.clear();
      window.location.href = '/login'; // O la ruta de tu login
    }
  }
});