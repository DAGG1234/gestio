<!-- src/components/IncomeExpenseChart.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useCurrencyToggle } from '@/stores/useCurrencyToggle'

const props = defineProps<{
  income: number
  expense: number
}>()

const currencyStore = useCurrencyToggle()

const hoveredSegment = ref<'income' | 'expense' | null>(null)

// Los valores ya vienen adaptados desde el padre según la moneda activa
const total = computed(() => props.income + props.expense)

const incomePercentage = computed(() => {
  if (total.value === 0) return 50
  return (props.income / total.value) * 100
})

const conicGradientStyle = computed(() => {
  if (total.value === 0) {
    return { background: '#e2e8f0' }
  }
  const incomeAngle = (incomePercentage.value / 100) * 360

  const incomeColor = hoveredSegment.value === 'expense' ? 'rgba(16, 185, 129, 0.35)' : '#10b981'
  const expenseColor = hoveredSegment.value === 'income' ? 'rgba(244, 63, 94, 0.35)' : '#f43f5e'

  return {
    background: `conic-gradient(${incomeColor} 0deg ${incomeAngle}deg, ${expenseColor} ${incomeAngle}deg 360deg)`
  }
})

// Título superior dinámico dentro de la dona
const centerTitle = computed(() => {
  if (hoveredSegment.value === 'income') return 'Ingreso'
  if (hoveredSegment.value === 'expense') return 'Egreso'
  return 'Neto'
})

// Cifra central adaptada usando los valores directos de las props
const centerDisplayValue = computed(() => {
  if (hoveredSegment.value === 'income') return currencyStore.formatMoney(props.income)
  if (hoveredSegment.value === 'expense') return currencyStore.formatMoney(props.expense)
  return currencyStore.formatMoney(props.income - props.expense)
})
</script>

<template>
  <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
    <!-- Cabecera de la tarjeta -->
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Resumen Global</h3>
      <span class="text-[11px] font-medium text-slate-400">Flujo actual ({{ currencyStore.currentCurrency }})</span>
    </div>
    
    <!-- Contenido central: Dona interactiva + Leyendas -->
    <div class="flex flex-col sm:flex-row items-center justify-around gap-4 py-3">
      
      <!-- Gráfica de dona -->
      <div 
        class="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shadow-inner transition-all duration-300 shrink-0"
        :class="hoveredSegment ? 'scale-105 shadow-md' : ''"
        :style="conicGradientStyle"
        @mouseleave="hoveredSegment = null"
      >
        <!-- Círculo interior con etiqueta sutil y cifra -->
        <div class="absolute inset-4 sm:inset-4.5 bg-white rounded-full flex flex-col items-center justify-center shadow-xs px-1 text-center transition-transform duration-300">
          <span class="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">
            {{ centerTitle }}
          </span>
          <span class="text-[10px] sm:text-xs font-extrabold text-slate-900 tracking-tight leading-tight break-all">
            {{ centerDisplayValue }}
          </span>
        </div>
      </div>

      <!-- Leyendas laterales interactivas -->
      <div class="flex flex-col gap-2.5 w-full sm:w-auto">
        <!-- Ficha de Ingresos -->
        <div 
          @mouseenter="hoveredSegment = 'income'"
          @mouseleave="hoveredSegment = null"
          :class="[
            'flex items-center justify-between sm:justify-start gap-4 px-3.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer',
            hoveredSegment === 'income' ? 'bg-emerald-50 border-emerald-300 shadow-2xs scale-[1.02]' : 'bg-slate-50/80 border-slate-100 opacity-90'
          ]"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 transition-transform" :class="hoveredSegment === 'income' ? 'scale-125 ring-2 ring-emerald-200' : ''"></span>
            <span class="text-xs font-medium text-slate-600">Ingresos</span>
          </div>
          <span class="text-xs font-bold text-emerald-600">{{ currencyStore.formatMoney(props.income) }}</span>
        </div>

        <!-- Ficha de Egresos -->
        <div 
          @mouseenter="hoveredSegment = 'expense'"
          @mouseleave="hoveredSegment = null"
          :class="[
            'flex items-center justify-between sm:justify-start gap-4 px-3.5 py-2 rounded-xl border transition-all duration-200 cursor-pointer',
            hoveredSegment === 'expense' ? 'bg-rose-50 border-rose-300 shadow-2xs scale-[1.02]' : 'bg-slate-50/80 border-slate-100 opacity-90'
          ]"
        >
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 transition-transform" :class="hoveredSegment === 'expense' ? 'scale-125 ring-2 ring-rose-200' : ''"></span>
            <span class="text-xs font-medium text-slate-600">Egresos</span>
          </div>
          <span class="text-xs font-bold text-rose-600">{{ currencyStore.formatMoney(props.expense) }}</span>
        </div>
      </div>

    </div>

    <!-- Pie de tarjeta sutil -->
    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
      <span>Proporción de movimientos</span>
      <span>Total: {{ currencyStore.formatMoney(total) }}</span>
    </div>
  </div>
</template>