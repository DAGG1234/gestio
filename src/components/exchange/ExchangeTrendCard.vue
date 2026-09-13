<!-- src/components/exchange/ExchangeTrendCard.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  rate: number
}>()

const sparklinePoints = computed(() => {
  const base = props.rate
  // Se usa un histórico simulado pero con proporciones estables respecto a la tasa actual
  return [
    { day: 'Lun', rate: base * 0.985, change: -0.2 },
    { day: 'Mar', rate: base * 0.992, change: +0.7 },
    { day: 'Mié', rate: base * 0.988, change: -0.4 },
    { day: 'Jue', rate: base * 0.995, change: +0.7 },
    { day: 'Hoy', rate: base, change: +0.5 }
  ]
})

// Normalizador seguro para la altura de las barras (evita desbordamientos o alturas negativas)
const barHeights = computed(() => {
  const rates = sparklinePoints.value.map(p => p.rate)
  const min = Math.min(...rates)
  const max = Math.max(...rates)
  const range = max - min || 1

  return sparklinePoints.value.map(item => {
    // Escala cada barra entre un 25% y un 90% de altura para mantener estética visual
    const normalized = (item.rate - min) / range
    return Math.round(25 + normalized * 65)
  })
})
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
    <div>
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide">Tendencia de la Tasa (Últimos 5 días)</h3>
        <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">+ Dinámica</span>
      </div>
      <p class="text-xs text-slate-400 font-medium mb-4">Comportamiento con fluctuaciones de referencia del Dólar BCV.</p>

      <!-- Gráfica con líneas de referencia horizontales al fondo y estilo limpio -->
      <div class="relative py-2 mt-4">
        
        <!-- Líneas de referencia horizontales de fondo estilo grid -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6">
          <div class="w-full border-b border-slate-100"></div>
          <div class="w-full border-b border-slate-100"></div>
          <div class="w-full border-b border-slate-100"></div>
        </div>

        <!-- Contenedor de las barras -->
        <div class="relative z-10 flex items-end justify-between h-32 px-3 gap-3">
          <div v-for="(item, idx) in sparklinePoints" :key="idx" class="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            <!-- Etiqueta de valor superior -->
            <span class="text-[9px] sm:text-[10px] font-black text-slate-700 tracking-tighter bg-white/80 px-1 rounded">
              {{ item.rate.toFixed(1) }}
            </span>
            
            <!-- Barra vertical limpia con altura normalizada de forma segura -->
            <div 
              class="w-full max-w-[36px] rounded-t-lg transition-all duration-300 shadow-2xs"
              :class="item.change >= 0 ? 'bg-sky-400 hover:bg-sky-500' : 'bg-sky-300 hover:bg-sky-400'"
              :style="{ height: `${barHeights[idx]}%` }"
            ></div>
            
            <!-- Día de la semana -->
            <span class="text-[10px] font-bold text-slate-500 mt-1">{{ item.day }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
      <span>Variación acumulada semanal</span>
      <span class="font-bold text-emerald-600">+0.45% Activo</span>
    </div>
  </div>
</template>