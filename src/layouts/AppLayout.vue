<!-- src/layouts/AppLayout.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import MobileNav from '@/components/MobileNav.vue'
import InstallPrompt from '@/components/InstallPrompt.vue' // <--- 1. Importa el componente
</script>

<template>
  <main class="h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100 flex flex-col md:flex-row select-none">
    <!-- Menú Lateral de Escritorio -->
    <Sidebar class="hidden md:flex shrink-0" />

    <!-- Contenedor Central Dinámico -->
    <div class="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0">
      <RouterView />
    </div>

    <!-- Navegación Inferior para Dispositivos Móviles -->
    <MobileNav class="md:hidden" />

    <!-- 2. Agrega el componente flotante aquí -->
    <InstallPrompt />
  </main>
</template>