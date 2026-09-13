<!-- src/layouts/AppLayout.vue -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import MobileNav from '@/components/MobileNav.vue'
import InstallPrompt from '@/components/InstallPrompt.vue'
</script>

<template>
  <main class="h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-100 flex flex-col md:flex-row select-none">
    <!-- Menú Lateral de Escritorio (Oscuro) -->
    <Sidebar class="hidden md:flex shrink-0" />

    <!-- Contenedor Central Dinámico (Fondo gris/slate para que las tarjetas resalten) -->
    <div class="flex-1 flex flex-col h-full overflow-hidden pb-16 md:pb-0 bg-slate-900 text-slate-100 overflow-y-auto">
      <RouterView />
    </div>

    <!-- Navegación Inferior para Dispositivos Móviles -->
    <MobileNav class="md:hidden" />

    <!-- Componente flotante de instalación -->
    <InstallPrompt />
  </main>
</template>