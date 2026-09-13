// src/components/Sidebar.vue
<script setup lang="ts">
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import GestioLogo from '@/assets/gestioIco.svg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
  { name: 'Auditoria', path: '/audit', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { name: 'Ahorro', path: '/savings', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'Deudas', path: '/debts', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { name: 'Salud Financiera', path: '/financial-health', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'Al Cambio', path: '/exchange', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { name: 'Configuración', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
]

const isActiveRoute = (path: string) => {
  return route.path === path || (path === '/dashboard' && route.path === '/')
}

const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  } finally {
    router.push({ name: 'login' })
  }
}
</script>

<template>
  <aside class="hidden md:flex flex-col w-64 bg-gradient-to-br from-[#0b4d6c] via-[#093d56] to-[#073044] text-white p-6 shrink-0 h-full select-none justify-between shadow-2xl">
    <div class="space-y-8">
      <!-- Logotipo -->
      <div class="flex items-center gap-3 px-2">
        <div class="w-10 h-10 flex items-center justify-center">
          <img :src="GestioLogo" alt="Gestio Logo" class="w-full h-full object-contain [filter:brightness(0)_invert(1)]" />
        </div>
        <span class="text-xl font-black tracking-widest uppercase text-white">Gestio</span>
      </div>

      <!-- Navegación con verificación computada directa -->
      <nav class="space-y-2">
        <RouterLink
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200',
            isActiveRoute(item.path)
              ? 'bg-white/20 font-bold text-white shadow-lg border-l-4 border-emerald-400 pl-3.5'
              : 'text-slate-300 hover:bg-white/10 hover:text-white font-medium'
          ]"
        >
          <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon" />
          </svg>
          {{ item.name }}
        </RouterLink>
      </nav>
    </div>

    <!-- Botón de Cerrar Sesión -->
    <button
      @click="handleLogout"
      class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-200 hover:bg-rose-500/10 hover:text-white transition-colors cursor-pointer"
    >
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
      Cerrar Sesión
    </button>
  </aside>
</template>