<!-- src/components/audit/AuditProjectionsCard.vue -->
<script setup lang="ts">
import { useAuditingStore } from '@/stores/useAuditingStore'
import { useCurrencyToggle } from '@/stores/useCurrencyToggle'

const auditStore = useAuditingStore()
const currencyStore = useCurrencyToggle()
</script>

<template>
  <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
    <div class="space-y-1 text-center md:text-left">
      <div class="flex items-center justify-center md:justify-start gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Proyección de Cierre de Mes</h3>
      </div>
      <p class="text-xs text-slate-500 font-medium">
        Estimación basada en tu ritmo de consumo actual para el ciclo seleccionado.
      </p>
    </div>

    <div class="flex flex-wrap items-center justify-center gap-4">
      <div class="bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80 text-center">
        <span class="block text-[10px] font-bold text-slate-400 uppercase">Gasto Proyectado</span>
        <span class="text-sm font-black text-slate-900">{{ currencyStore.formatMoney(auditStore.projection.projectedTotalExpense) }}</span>
      </div>

      <div class="bg-sky-50 px-4 py-2.5 rounded-xl border border-sky-100 text-center">
        <span class="block text-[10px] font-bold text-sky-600 uppercase">Estado / Desviación</span>
        <span class="text-xs font-bold text-sky-900">{{ auditStore.projection.spendingDeviation }}</span>
      </div>
    </div>
  </div>
</template>