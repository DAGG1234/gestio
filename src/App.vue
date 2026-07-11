<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useUserStore } from './stores/userStore';

const store = useUserStore();

// Función para sincronizar la clase 'dark' con el elemento raíz
const updateThemeClass = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Al cargar la app, aplicamos el tema guardado
onMounted(() => {
  updateThemeClass(store.isDarkMode);
});

// Observamos cambios para actualizar el DOM en tiempo real
watch(() => store.isDarkMode, (newVal) => {
  updateThemeClass(newVal);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
    <RouterView />
  </div>
</template>