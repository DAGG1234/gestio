<!-- src/components/MobileNav.vue -->
<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const mobileNavItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z'
  },
  {
    name: 'Auditoría',
    path: '/audit',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
  },
  {
    name: 'Ahorro',
    path: '/savings',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    name: 'Deudas',
    path: '/debts',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  },
  {
    name: 'Salud',
    path: '/financial-health',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  },
  {
    name: 'Cambio',
    path: '/exchange',
    icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
  },
  {
    name: 'Ajustes',
    path: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z'
  }
]

const isActiveRoute = (path: string) => {
  return route.path === path || (path === '/dashboard' && route.path === '/')
}
</script>

<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 px-0.5 flex items-center justify-between z-40 shadow-xl select-none">
    <RouterLink
      v-for="item in mobileNavItems"
      :key="item.path"
      :to="item.path"
      v-slot="{ navigate }"
      custom
    >
      <button
        @click="navigate"
        :class="[
          'relative flex flex-col items-center justify-center flex-1 h-full py-1 transition-all cursor-pointer group',
          isActiveRoute(item.path) ? 'text-[#0b4d6c]' : 'text-slate-400 hover:text-slate-600'
        ]"
      >
        <!-- Indicador de ubicación superior -->
        <span v-if="isActiveRoute(item.path)" class="absolute top-0 w-6 h-1 bg-[#0b4d6c] rounded-b-full shadow-[0_2px_6px_rgba(11,77,108,0.4)]"></span>

        <!-- Contenedor del icono -->
        <div :class="[
          'p-1 rounded-xl transition-all',
          isActiveRoute(item.path) ? 'bg-[#0b4d6c]/10 text-[#0b4d6c] scale-105' : 'text-slate-400 group-hover:text-slate-600'
        ]">
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
        </div>

        <!-- Etiqueta de texto compacta -->
        <span :class="[
          'text-[9px] tracking-tighter truncate w-full px-0.5 text-center transition-all',
          isActiveRoute(item.path) ? 'text-[#0b4d6c] font-black scale-105' : 'text-slate-500 font-medium'
        ]">
          {{ item.name }}
        </span>
      </button>
    </RouterLink>
  </nav>
</template>