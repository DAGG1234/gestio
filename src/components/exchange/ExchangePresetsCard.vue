<!-- src/components/exchange/ExchangePresetsCard.vue -->
<script setup lang="ts">
defineProps<{
  rate: number
}>()
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
    <div>
      <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">Equivalencias Clave</h3>
      <p class="text-xs text-slate-400 font-medium mb-4">Cálculo automático de referencia</p>

      <div class="space-y-3">
        <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
          <span class="font-bold text-slate-600">$10.00</span>
          <span class="font-black text-slate-900">Bs. {{ (10 * rate).toFixed(2) }}</span>
        </div>
        <div class="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
          <span class="font-bold text-slate-600">$50.00</span>
          <span class="font-black text-slate-900">Bs. {{ (50 * rate).toFixed(2) }}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-slate-600">$100.00</span>
          <span class="font-black text-slate-900">Bs. {{ (100 * rate).toFixed(2) }}</span>
        </div>
      </div>
    </div>
    <div class="pt-4 text-[10px] font-medium text-slate-400 uppercase">
      Base BCV en tiempo real.
    </div>
  </div>
</template>