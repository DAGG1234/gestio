<!-- src/components/audit/AuditTransactionTable.vue -->
<script setup lang="ts">
import { useAuditingStore } from '@/stores/useAuditingStore'
import { useCurrencyToggle } from '@/stores/useCurrencyToggle'

const auditStore = useAuditingStore()
const currencyStore = useCurrencyToggle()

// Función auxiliar para formatear la fecha localmente sin desfases de zona horaria
const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const parts = dateStr.split('T')[0].split('-')
  if (parts.length !== 3) return dateStr
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}
</script>

<template>
  <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Historial Maestro de Movimientos</h3>
        <p class="text-[11px] text-slate-400 mt-0.5">Registro cronológico detallado del ciclo</p>
      </div>

      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <input
          v-model="auditStore.searchQuery"
          type="text"
          placeholder="Buscar concepto o categoría..."
          class="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0b4d6c] w-full sm:w-60 shadow-2xs"
        />

        <!-- Botón que activa la exportación profesional corporativa -->
        <button
          @click="auditStore.exportToExcel()"
          class="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-98"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
          Exportar Excel
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto rounded-xl border border-slate-100">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200/80">
            <th class="p-3">Fecha</th>
            <th class="p-3">Tipo</th>
            <th class="p-3">Categoría</th>
            <th class="p-3">Descripción</th>
            <th class="p-3 text-right">Monto</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium text-slate-700">
          <tr v-if="auditStore.filteredTransactions.length === 0">
            <td colspan="5" class="text-center py-8 text-slate-400 font-normal">
              No se encontraron movimientos registrados en este ciclo temporal.
            </td>
          </tr>
          <tr v-for="t in auditStore.filteredTransactions" :key="t.id" class="hover:bg-slate-50/60 transition-colors">
            <td class="p-3 text-slate-500">{{ formatDate(t.date) }}</td>
            <td class="p-3">
              <span :class="['px-2 py-0.5 rounded-md text-[10px] font-bold', t.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700']">
                {{ t.type === 'income' ? 'Ingreso' : 'Egreso' }}
              </span>
            </td>
            <td class="p-3 font-semibold text-slate-800">{{ t.category }}</td>
            <td class="p-3 text-slate-600">{{ t.description }}</td>
            <td :class="['p-3 text-right font-extrabold', t.type === 'income' ? 'text-emerald-600' : 'text-rose-600']">
              {{ t.type === 'income' ? '+' : '-' }}{{ currencyStore.formatMoney(t.amount) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>