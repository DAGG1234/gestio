<!-- src/components/settings/PreferencesCard.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isOpen = ref(false)
const selectedTheme = ref(localStorage.getItem('gestio_theme') || 'original')

const themes = [
  { id: 'original', name: 'Original (Esmeralda)', colorClass: 'bg-emerald-600' },
  { id: 'rosa', name: 'Rosa (Fucsia)', colorClass: 'bg-pink-600' },
  { id: 'azul', name: 'Azul (Cian)', colorClass: 'bg-blue-600' },
  { id: 'negro', name: 'Negro (Minimal)', colorClass: 'bg-slate-900' }
]

const togglePreferences = () => {
  isOpen.value = !isOpen.value
}

const applyTheme = (themeId: string) => {
  selectedTheme.value = themeId
  localStorage.setItem('gestio_theme', themeId)
  document.documentElement.setAttribute('data-theme', themeId)
}

onMounted(() => {
  document.documentElement.setAttribute('data-theme', selectedTheme.value)
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 73.172l4 4m0 0l4-4m-4 4V12" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">Apariencia</h2>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Personaliza los temas de color de la interfaz</p>
        </div>
      </div>
      <button
        @click="togglePreferences"
        type="button"
        class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {{ isOpen ? 'Ocultar Temas' : 'Cambiar colores' }}
      </button>
    </div>

    <!-- Selector de Temas Desplegable -->
    <div v-if="isOpen" class="pt-6 transition-all animate-fadeIn">
      <p class="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Selecciona un esquema de colores:</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        <button
          v-for="theme in themes"
          :key="theme.id"
          @click="applyTheme(theme.id)"
          type="button"
          :class="[
            'p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left',
            selectedTheme === theme.id
              ? 'border-emerald-500 bg-emerald-50/50 shadow-sm ring-1 ring-emerald-500'
              : 'border-slate-200 hover:bg-slate-50 bg-white'
          ]"
        >
          <div :class="['w-5 h-5 rounded-full shrink-0 shadow-sm', theme.colorClass]"></div>
          <div>
            <span class="block text-xs font-bold text-slate-800 uppercase tracking-wide">{{ theme.name }}</span>
            <span class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {{ selectedTheme === theme.id ? 'Activo' : 'Elegir' }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>