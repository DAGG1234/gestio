<!-- src/components/audit/AuditChartSection.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuditingStore } from '@/stores/useAuditingStore'
import { useCurrencyToggle } from '@/stores/useCurrencyToggle'

const auditStore = useAuditingStore()
const currencyStore = useCurrencyToggle()

// Tipo de vista gráfica seleccionada ('donut' | 'bars' | 'categories')
const chartType = ref<'donut' | 'bars' | 'categories'>('donut')

// Filtro específico de categoría ('all' o el nombre exacto de la categoría)
const selectedCategoryFilter = ref<string>('all')

// Paleta de colores para cuando se analizan categorías individuales
const categoryColors = [
  '#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#f43f5e', 
  '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4', '#ec4899'
]

// 1. Obtener lista única de categorías disponibles según el ciclo y tipo de métrica seleccionada
const availableCategories = computed(() => {
  const cats = new Set<string>()
  auditStore.filteredTransactions.forEach(t => {
    if (auditStore.chartMetricFilter === 'all' || t.type === auditStore.chartMetricFilter) {
      cats.add(t.category)
    }
  })
  return Array.from(cats).sort()
})

// 2. Transacciones completamente filtradas (Métrica + Categoría específica)
const fullyFilteredTransactions = computed(() => {
  return auditStore.filteredTransactions.filter(t => {
    const matchesMetric = auditStore.chartMetricFilter === 'all' || t.type === auditStore.chartMetricFilter
    const matchesCategory = selectedCategoryFilter.value === 'all' || t.category === selectedCategoryFilter.value
    return matchesMetric && matchesCategory
  })
})

// Totales recalculados basados en los filtros activos
const activeTotalIncome = computed(() => {
  return fullyFilteredTransactions.value
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0)
})

const activeTotalExpense = computed(() => {
  return fullyFilteredTransactions.value
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0)
})

const activeTotalVolume = computed(() => {
  return fullyFilteredTransactions.value.reduce((acc, t) => acc + t.amount, 0)
})

// Porcentajes para la vista de Ingresos vs Egresos (cuando está en 'all' sin categoría específica)
const incomePercentage = computed(() => {
  if (activeTotalVolume.value === 0) return 0
  return (activeTotalIncome.value / activeTotalVolume.value) * 100
})
const expensePercentage = computed(() => {
  if (activeTotalVolume.value === 0) return 0
  return (activeTotalExpense.value / activeTotalVolume.value) * 100
})

const incomeStrokeDasharray = computed(() => {
  const inc = incomePercentage.value
  return `${inc} ${100 - inc}`
})

// 3. Desglose avanzado por categoría (con colores propios para cuando se requiera)
const categoryBreakdown = computed(() => {
  const map: Record<string, { income: number; expense: number; count: number; total: number }> = {}
  
  fullyFilteredTransactions.value.forEach(t => {
    if (!map[t.category]) {
      map[t.category] = { income: 0, expense: 0, count: 0, total: 0 }
    }
    if (t.type === 'income') {
      map[t.category].income += t.amount
    } else {
      map[t.category].expense += t.amount
    }
    map[t.category].total += t.amount
    map[t.category].count += 1
  })

  const list = Object.entries(map).map(([category, values]) => ({
    category,
    ...values
  })).sort((a, b) => b.total - a.total)

  const maxTotal = Math.max(...list.map(i => i.total), 1)
  const grandTotal = list.reduce((acc, i) => acc + i.total, 0)

  let cumulativePercentage = 0
  return list.map((item, index) => {
    const percentage = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0
    const strokeDasharray = `${percentage} ${100 - percentage}`
    const strokeDashoffset = -cumulativePercentage
    cumulativePercentage += percentage

    return {
      ...item,
      barPercentage: (item.total / maxTotal) * 100,
      percentage,
      colorHex: categoryColors[index % categoryColors.length],
      strokeDasharray,
      strokeDashoffset
    }
  })
})

const handleMetricChange = (metric: 'all' | 'income' | 'expense') => {
  auditStore.chartMetricFilter = metric
  selectedCategoryFilter.value = 'all'
}
</script>

<template>
  <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 sm:space-y-6">
    
    <!-- Cabecera y Filtros Unificados (Responsivos) -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
      <div>
        <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Desglose Analítico y Gráficas del Ciclo</h3>
        <p class="text-[11px] text-slate-400 mt-0.5">Visualización financiera adaptativa y responsiva</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        
        <!-- 1. Filtro de Métrica -->
        <div class="flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
          <button
            @click="handleMetricChange('all')"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', auditStore.chartMetricFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800']"
          >
            Todo
          </button>
          <button
            @click="handleMetricChange('income')"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', auditStore.chartMetricFilter === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800']"
          >
            Ingresos
          </button>
          <button
            @click="handleMetricChange('expense')"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', auditStore.chartMetricFilter === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800']"
          >
            Egresos
          </button>
        </div>

        <!-- 2. Filtro de Categoría -->
        <div class="relative w-full sm:w-auto">
          <select
            v-model="selectedCategoryFilter"
            class="w-full sm:w-auto bg-slate-100/80 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-[#0b4d6c]/20 cursor-pointer truncate"
          >
            <option value="all">Todas las categorías</option>
            <option v-for="cat in availableCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <!-- 3. Selector de Tipo de Vista Gráfica -->
        <div class="flex items-center gap-0.5 bg-slate-100/80 p-1 rounded-xl text-xs font-bold border border-slate-200/60">
          <button
            @click="chartType = 'donut'"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', chartType === 'donut' ? 'bg-[#0b4d6c] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800']"
          >
            Circular
          </button>
          <button
            @click="chartType = 'bars'"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', chartType === 'bars' ? 'bg-[#0b4d6c] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800']"
          >
            Barras
          </button>
          <button
            @click="chartType = 'categories'"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', chartType === 'categories' ? 'bg-[#0b4d6c] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800']"
          >
            Desglose
          </button>
        </div>

      </div>
    </div>

    <!-- Contenedor Principal de Visualización Responsivo -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
      
      <!-- ZONA IZQUIERDA: GRÁFICAS -->
      <div class="lg:col-span-5 bg-slate-50/70 p-4 sm:p-6 rounded-2xl border border-slate-100 flex flex-col items-center justify-center min-h-[260px] sm:min-h-[280px]">
        
        <!-- VISTA 1: DONUT -->
        <div v-if="chartType === 'donut'" class="flex flex-col items-center justify-center w-full">
          <div class="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            
            <!-- CASO A: TODO (Verde y Rojo) -->
            <svg v-if="auditStore.chartMetricFilter === 'all' && selectedCategoryFilter === 'all'" class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                class="text-rose-500"
                stroke-width="4.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                class="text-emerald-500 transition-all duration-700 ease-out"
                :stroke-dasharray="incomeStrokeDasharray"
                stroke-width="4.2"
                stroke-linecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>

            <!-- CASO B: FILTRADO (Multicolor por categoría) -->
            <svg v-else class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e2e8f0" stroke-width="4.2" />
              <circle
                v-for="item in categoryBreakdown"
                :key="item.category"
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                :stroke="item.colorHex"
                stroke-width="4.2"
                stroke-linecap="round"
                :stroke-dasharray="item.strokeDasharray"
                :stroke-dashoffset="item.strokeDashoffset"
                class="transition-all duration-700 ease-out"
              />
            </svg>

            <div class="absolute inset-0 flex flex-col items-center justify-center text-center px-2">
              <span class="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-wider text-slate-400">Volumen</span>
              <span class="text-xs sm:text-sm font-black text-slate-900 mt-0.5 truncate max-w-[100px] sm:max-w-[120px]">{{ currencyStore.formatMoney(activeTotalVolume) }}</span>
            </div>
          </div>

          <!-- Leyendas -->
          <div v-if="auditStore.chartMetricFilter === 'all' && selectedCategoryFilter === 'all'" class="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-5 text-xs font-bold text-slate-600">
            <div class="flex items-center gap-1.5 sm:gap-2">
              <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shadow-xs"></span>
              <span>Ingresos ({{ incomePercentage.toFixed(0) }}%)</span>
            </div>
            <div class="flex items-center gap-1.5 sm:gap-2">
              <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 shadow-xs"></span>
              <span>Egresos ({{ expensePercentage.toFixed(0) }}%)</span>
            </div>
          </div>
          <div v-else class="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 max-w-xs">
            <div v-for="item in categoryBreakdown.slice(0, 4)" :key="item.category" class="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600">
              <span class="w-2.5 h-2.5 rounded-full shadow-2xs shrink-0" :style="{ backgroundColor: item.colorHex }"></span>
              <span class="truncate max-w-[80px] sm:max-w-[90px]">{{ item.category }}</span>
            </div>
          </div>
        </div>

        <!-- VISTA 2: BARRAS -->
        <div v-if="chartType === 'bars'" class="w-full space-y-3.5 sm:space-y-4 max-h-56 sm:max-h-60 overflow-y-auto pr-1 custom-scrollbar">
          <template v-if="auditStore.chartMetricFilter === 'all' && selectedCategoryFilter === 'all'">
            <div class="space-y-1.5">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-slate-700 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ingresos Totales</span>
                <span class="text-emerald-600">{{ currencyStore.formatMoney(activeTotalIncome) }}</span>
              </div>
              <div class="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-700" style="width: 100%"></div>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center text-xs font-bold">
                <span class="text-slate-700 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Egresos Totales</span>
                <span class="text-rose-600">{{ currencyStore.formatMoney(activeTotalExpense) }}</span>
              </div>
              <div class="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
                <div 
                  class="bg-rose-500 h-full rounded-full transition-all duration-700" 
                  :style="{ width: `${Math.min((activeTotalExpense / (activeTotalIncome || 1)) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </template>

          <template v-else>
            <div v-if="categoryBreakdown.length === 0" class="text-xs text-slate-400 text-center py-10">
              No hay datos para mostrar en barras.
            </div>
            <div v-for="item in categoryBreakdown" :key="item.category" class="space-y-1">
              <div class="flex justify-between items-center text-xs font-bold gap-2">
                <span class="text-slate-700 flex items-center gap-2 truncate">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: item.colorHex }"></span>
                  <span class="truncate">{{ item.category }}</span>
                </span>
                <span class="text-slate-900 shrink-0">{{ currencyStore.formatMoney(item.total) }}</span>
              </div>
              <div class="w-full bg-slate-200/80 h-3 rounded-full overflow-hidden shadow-inner p-0.5">
                <div 
                  class="h-full rounded-full transition-all duration-700" 
                  :style="{ width: `${Math.max(item.barPercentage, 6)}%`, backgroundColor: item.colorHex }"
                ></div>
              </div>
            </div>
          </template>
        </div>

        <!-- VISTA 3: RESUMEN DE CATEGORÍAS -->
        <div v-if="chartType === 'categories'" class="w-full space-y-3">
          <div class="text-center pb-2">
            <span class="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Categorías Activas</span>
            <h4 class="text-2xl font-black text-slate-900">{{ categoryBreakdown.length }}</h4>
          </div>
          <p class="text-[11px] text-slate-500 text-center truncate px-2">
            Filtrando por: <strong class="text-slate-800">{{ selectedCategoryFilter === 'all' ? 'Todas' : selectedCategoryFilter }}</strong>
          </p>
        </div>

      </div>

      <!-- ZONA DERECHA: DESGLOSE DETALLADO Y TARJETAS DE TOTALES -->
      <div class="lg:col-span-7 flex flex-col justify-between space-y-4">
        
        <div class="bg-slate-50/70 p-3 sm:p-4 rounded-2xl border border-slate-100 max-h-52 sm:max-h-56 overflow-y-auto space-y-2.5 custom-scrollbar">
          <div v-if="categoryBreakdown.length === 0" class="text-xs text-slate-400 text-center py-8">
            No hay registros para la combinación de filtros seleccionada.
          </div>
          <div v-for="item in categoryBreakdown" :key="item.category" class="flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-slate-200/60 shadow-2xs hover:border-slate-300 transition-all gap-2">
            <div class="flex items-center gap-2.5 truncate">
              <span 
                class="w-3 h-3 rounded-full shrink-0 shadow-2xs" 
                :style="{ backgroundColor: (auditStore.chartMetricFilter === 'all' && selectedCategoryFilter === 'all') ? (item.income > 0 ? '#10b981' : '#f43f5e') : item.colorHex }"
              ></span>
              <div class="flex flex-col truncate">
                <span class="font-bold text-slate-800 truncate">{{ item.category }}</span>
                <span class="text-[10px] text-slate-400 font-medium truncate">{{ item.count }} mov(s) • {{ item.percentage.toFixed(1) }}%</span>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 shrink-0">
              <span v-if="item.income > 0" class="text-emerald-600 font-extrabold">+{{ currencyStore.formatMoney(item.income) }}</span>
              <span v-if="item.expense > 0" class="text-rose-600 font-extrabold">-{{ currencyStore.formatMoney(item.expense) }}</span>
            </div>
          </div>
        </div>

        <!-- Indicadores inferiores responsivos -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold text-slate-400 truncate">Ingresos Filtrados</span>
            <span class="text-xs font-black text-emerald-600 shrink-0">{{ currencyStore.formatMoney(activeTotalIncome) }}</span>
          </div>
          <div class="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
            <span class="text-[11px] font-bold text-slate-400 truncate">Egresos Filtrados</span>
            <span class="text-xs font-black text-rose-600 shrink-0">{{ currencyStore.formatMoney(activeTotalExpense) }}</span>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>