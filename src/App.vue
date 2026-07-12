<script setup lang="ts">
import { inject } from '@vercel/analytics';

inject();
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans transition-colors duration-300">
    <RouterView />
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
}
</style>