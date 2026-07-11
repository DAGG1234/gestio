<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useUserStore } from './stores/userStore';

const store = useUserStore();

const updateThemeClass = (isDark: boolean) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

onMounted(() => {
  updateThemeClass(store.isDarkMode);
});

watch(() => store.isDarkMode, (newVal) => {
  updateThemeClass(newVal);
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors duration-300">
    <RouterView />
  </div>
</template>