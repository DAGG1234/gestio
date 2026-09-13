<!-- src/components/exchange/ExchangeCard.vue -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{
  rate: number
  lastUpdate: string
  isUpdating: boolean
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const usdAmount = ref<number | null>(1)
const bsfAmount = ref<number | null>(props.rate)

const quickPresets = [5, 10, 20, 50, 100]

// Asegurar sincronización inicial y reactiva ante cambios de tasa
watch(() => props.rate, (newRate) => {
  if (usdAmount.value !== null) {
    bsfAmount.value = Number((usdAmount.value * newRate).toFixed(2))
  }
})

onMounted(() => {
  if (usdAmount.value !== null && props.rate) {
    bsfAmount.value = Number((usdAmount.value * props.rate).toFixed(2))
  }
})

const handleUsdInput = () => {
  if (usdAmount.value === null || isNaN(usdAmount.value)) {
    bsfAmount.value = null
    return
  }
  bsfAmount.value = Number((usdAmount.value * props.rate).toFixed(2))
}

const handleBsfInput = () => {
  if (bsfAmount.value === null || isNaN(bsfAmount.value)) {
    usdAmount.value = null
    return
  }
  usdAmount.value = Number((bsfAmount.value / props.rate).toFixed(2))
}

const setPreset = (val: number) => {
  usdAmount.value = val
  handleUsdInput()
}

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm">
    <div class="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
          $
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-slate-800 text-sm uppercase tracking-wide">Dólar BCV</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200/60 uppercase">
              Tasa Oficial
            </span>
          </div>
          <p class="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider truncate">{{ lastUpdate || 'Sincronizado' }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <div class="text-right">
          <div class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Bs. {{ rate.toFixed(2) }}
          </div>
          <div class="flex items-center justify-end gap-1 text-xs font-bold mt-0.5 text-emerald-600">
            <span>Oficial BCV</span>
          </div>
        </div>

        <button
          @click="emit('refresh')"
          :disabled="isUpdating"
          class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
          title="Actualizar Tasa"
        >
          <svg :class="{ 'animate-spin': isUpdating }" class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Campos de entrada reactivos -->
    <div class="pt-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        <!-- Input USD -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Monto en Dólares</label>
            <button 
              @click="usdAmount !== null && copyToClipboard(usdAmount.toString())"
              class="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase cursor-pointer"
            >
              Copiar
            </button>
          </div>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">$</span>
            <input
              type="number"
              v-model.number="usdAmount"
              @input="handleUsdInput"
              placeholder="0.00"
              step="any"
              min="0"
              class="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

        <!-- Input Bs -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-slate-700 uppercase tracking-wider">Monto en Bolívares</label>
            <button 
              @click="bsfAmount !== null && copyToClipboard(bsfAmount.toString())"
              class="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 uppercase cursor-pointer"
            >
              Copiar
            </button>
          </div>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 font-bold">Bs</span>
            <input
              type="number"
              v-model.number="bsfAmount"
              @input="handleBsfInput"
              placeholder="0.00"
              step="any"
              min="0"
              class="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>

      </div>

      <!-- Botones de Acceso Rápido (Presets) -->
      <div class="pt-2">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Montos frecuentes rápidos:</span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="preset in quickPresets"
            :key="preset"
            @click="setPreset(preset)"
            class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200 text-xs font-bold text-slate-700 transition-all cursor-pointer"
          >
            ${{ preset }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>