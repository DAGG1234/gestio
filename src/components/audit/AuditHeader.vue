<!-- src/components/audit/AuditHeader.vue -->
<script setup lang="ts">
import { useAuditingStore } from '@/stores/useAuditingStore'

const auditStore = useAuditingStore()
</script>

<template>
  <header class="bg-white border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between shrink-0 gap-3 shadow-2xs">
    <div>
      <h1 class="text-lg font-bold text-slate-900 tracking-tight">Auditoría Financiera</h1>
      <p class="text-xs text-slate-400 font-medium mt-0.5">Control de cierres, métricas y proyecciones del ciclo temporal</p>
    </div>

    <!-- Selector de Ciclo Temporal (Mes y Año) -->
    <div class="flex items-center gap-2">
      <select
        v-model="auditStore.selectedMonth"
        class="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0b4d6c] cursor-pointer shadow-2xs"
      >
        <option v-for="(month, index) in auditStore.monthsList" :key="index" :value="index">
          {{ month }}
        </option>
      </select>

      <select
        v-model="auditStore.selectedYear"
        class="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#0b4d6c] cursor-pointer shadow-2xs"
      >
        <option v-for="year in auditStore.availableYears" :key="year" :value="year">
          {{ year }}
        </option>
      </select>
    </div>
  </header>
</template>