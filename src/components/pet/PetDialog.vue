<!-- src/components/pet/PetDialog.vue -->
<script setup lang="ts">
defineProps<{
  title: string
  message: string
  mood: 'happy' | 'neutral' | 'sad'
}>()
</script>

<template>
  <div class="w-full max-w-sm mx-auto mt-3 px-5 py-3.5 rounded-2xl shadow-lg border-2 transition-all flex items-start gap-3.5"
    :class="{
      'bg-emerald-900/90 border-emerald-400 text-emerald-100 shadow-emerald-950/20': mood === 'happy',
      'bg-slate-900/95 border-slate-700 text-slate-100 shadow-slate-950/30': mood === 'neutral',
      'bg-rose-950/95 border-rose-500 text-rose-100 shadow-rose-950/30': mood === 'sad'
    }"
  >
    <!-- Icono vectorial limpio en lugar de emoji -->
    <div class="pt-0.5 select-none flex-shrink-0">
      <!-- Icono de éxito / feliz (Sparkles / Check) -->
      <svg v-if="mood === 'happy'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>

      <!-- Icono de alerta / triste (Alerta / Warning) -->
      <svg v-else-if="mood === 'sad'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-rose-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>

      <!-- Icono neutral / informativo (Bombilla / Info) -->
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    </div>
    
    <div class="flex-1">
      <h4 class="text-[11px] sm:text-xs font-black uppercase tracking-wider mb-0.5"
        :class="{
          'text-emerald-300': mood === 'happy',
          'text-amber-300': mood === 'neutral',
          'text-rose-300': mood === 'sad'
        }"
      >
        {{ title }}
      </h4>
      <p class="text-[11px] sm:text-xs font-medium leading-relaxed opacity-95">
        {{ message }}
      </p>
    </div>
  </div>
</template>