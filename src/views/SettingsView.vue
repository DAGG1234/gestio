<!-- src/views/SettingsView.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import UserEditCard from '@/components/settings/UserEditCard.vue'
import PreferencesCard from '@/components/settings/PreferencesCard.vue'
import SupportCard from '@/components/settings/SupportCard.vue'
import ReviewsCard from '@/components/settings/ReviewsCard.vue' // <--- Importado correctamente
import DangerZoneCard from '@/components/settings/DangerZoneCard.vue'

const router = useRouter()
const authStore = useAuthStore()

// Nombre formateado del usuario
const username = computed(() => {
  const rawName = authStore.user?.username || 'Daniel'
  return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="h-full flex flex-col bg-slate-100 overflow-hidden">
    <!-- Header superior con la misma estructura y saludo personalizado de las demás vistas -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs gap-3">
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          Configuración
        </h1>
        <p class="text-xs sm:text-sm text-slate-500 font-medium truncate mt-0.5">
          Gestiona tu perfil, preferencias y datos del sistema, {{ username }}
        </p>
      </div>

      <!-- Botón de Cerrar Sesión en el header -->
      <button 
        @click="handleLogout"
        class="inline-flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 shrink-0 border border-rose-100 shadow-2xs"
        title="Cerrar sesión actual"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span class="hidden sm:inline">Cerrar Sesión</span>
      </button>
    </header>

    <!-- Contenido con scroll vertical, clases de scrollbar y espaciado optimizado -->
    <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 custom-scrollbar">
      <div class="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-20">
        <UserEditCard />
        <PreferencesCard />
        <SupportCard />
        <ReviewsCard /> <!-- <--- Integrado en la vista -->
        <DangerZoneCard />
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>