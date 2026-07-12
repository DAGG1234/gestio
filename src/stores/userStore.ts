import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  // 1. Estado: Aquí definimos los datos reactivos
  state: () => ({
    nombre: localStorage.getItem('usuarioNombre') || 'UsuarioV1',
    correo: 'usuariodeprueba@email.com',
  }),

  // 2. Acciones: Aquí definimos cómo modificar el estado
  actions: {
    cambiarNombre(nuevoNombre: string) {
      if (!nuevoNombre || nuevoNombre.trim() === '') return;

      // Actualizamos el estado (esto dispara la reactividad en toda la app)
      this.nombre = nuevoNombre;

      // Persistimos en el navegador
      localStorage.setItem('usuarioNombre', nuevoNombre);
    },

    cerrarSesion() {
      // Limpiamos el almacenamiento
      localStorage.removeItem('usuarioNombre');
      localStorage.removeItem('usuarioCorreo');
      localStorage.clear();

      // Redirigimos al login
      window.location.href = '/login';
    }
  }
});