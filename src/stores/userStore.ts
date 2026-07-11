import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    nombre: 'UsuarioV1',
    correo: 'usuariodeprueba@email.com',
    
    isDarkMode: localStorage.getItem('darkMode') === 'true',
  }),

  actions: {
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      localStorage.setItem('darkMode', this.isDarkMode.toString());
      
      if (this.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },

    cambiarPassword(passAnterior: string, passNueva: string) {
      if (!passAnterior || !passNueva) {
        alert("Por favor rellena ambos campos.");
        return;
      }
      console.log("Cambiando contraseña de:", passAnterior, "a:", passNueva);
      alert("Contraseña actualizada exitosamente.");
    },

    cerrarSesion() {
      localStorage.clear();
      window.location.href = '/login'; 
    }
  }
});