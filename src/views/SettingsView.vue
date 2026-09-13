<script setup lang="ts">
import UserEditCard from '@/components/settings/UserEditCard.vue'
import PreferencesCard from '@/components/settings/PreferencesCard.vue'
import DangerZoneCard from '@/components/settings/DangerZoneCard.vue'
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50/50 overflow-hidden">
    <!-- Header superior idéntico al del Dashboard (de extremo a extremo) -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs gap-3">
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          Configuración
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5">
          Gestiona tu perfil, preferencias y datos del sistema
        </p>
      </div>
    </header>

    <!-- Contenido con scroll vertical y las tarjetas del módulo -->
    <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div class="max-w-4xl mx-auto space-y-6 pb-20">
        <UserEditCard />
        <PreferencesCard />
        <DangerZoneCard />
      </div>
    </div>
  </div>
</template>