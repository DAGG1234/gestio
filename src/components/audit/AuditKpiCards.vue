<!-- src/components/audit/AuditKpiCards.vue -->
<script setup lang="ts">
import { useAuditingStore } from '@/stores/useAuditingStore'
import { useCurrencyToggle } from '@/stores/useCurrencyToggle'

const auditStore = useAuditingStore()
const currencyStore = useCurrencyToggle()
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Ingresos Totales -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ingresos Totales</span>
        <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
        </div>
      </div>
      <h3 class="text-2xl font-black text-slate-900 mt-3 tracking-tight">
        {{ currencyStore.formatMoney(auditStore.totalIncome) }}
      </h3>
      <span class="text-[10px] text-emerald-600 font-semibold mt-1">Flujo positivo del ciclo</span>
    </div>

    <!-- Egresos Totales -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Egresos Totales</span>
        <div class="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"/></svg>
        </div>
      </div>
      <h3 class="text-2xl font-black text-slate-900 mt-3 tracking-tight">
        {{ currencyStore.formatMoney(auditStore.totalExpense) }}
      </h3>
      <span class="text-[10px] text-rose-600 font-semibold mt-1">Gastos registrados</span>
    </div>

    <!-- Ahorros Netos -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Ahorro Neto</span>
        <div class="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
      </div>
      <h3 class="text-2xl font-black text-slate-900 mt-3 tracking-tight">
        {{ currencyStore.formatMoney(auditStore.netSavings) }}
      </h3>
      <span class="text-[10px] text-sky-600 font-semibold mt-1">Retención de capital</span>
    </div>

    <!-- Tasa de Ahorro Real -->
    <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
      <div class="flex items-center justify-between">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tasa de Ahorro</span>
        <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        </div>
      </div>
      <h3 class="text-2xl font-black text-slate-900 mt-3 tracking-tight">
        {{ auditStore.savingsRate.toFixed(1) }}%
      </h3>
      <span class="text-[10px] text-indigo-600 font-semibold mt-1">Rendimiento porcentual</span>
    </div>
  </div>
</template>