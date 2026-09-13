<!-- src/views/SavingsView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { useExchangeRateStore } from '@/stores/useExchangeRateStore'
import { useCurrencyToggle } from '@/stores/useCurrencyToggle'

const authStore = useAuthStore()
const financeStore = useFinanceStore()
const exchangeRateStore = useExchangeRateStore()
const currencyStore = useCurrencyToggle()

// Estados locales para modales y formularios
const showNewSavingModal = ref(false)
const showContributeModal = ref(false)
const selectedSavingId = ref<string | null>(null)

// Campos del formulario de Nuevo Ahorro
const newSavingTitle = ref('')
const newSavingTarget = ref<number | null>(null)
const newSavingCurrency = ref<'USD' | 'VES'>('USD')
const savingFormError = ref('')

// Campos del formulario de Abonar (Únicamente en Bolívares)
const contributeAmount = ref<number | null>(null)
const contributeError = ref('')

// Selector de moneda específico para la tarjeta de balance de ahorros ($ o Bs)
const savingsDisplayCurrency = ref<'USD' | 'VES'>('USD')

// Nombre formateado del usuario
const username = computed(() => {
  const rawName = authStore.user?.username || 'Daniel'
  return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
})

onMounted(() => {
  exchangeRateStore.fetchExchangeRate()
})

// Tasa de cambio BCV actual
const rate = computed(() => exchangeRateStore.rate || 1)

// Balance total acumulado en ahorros convertido dinámicamente según la moneda de visualización de la tarjeta
const convertedTotalSavings = computed(() => {
  let totalUSD = 0
  let totalVES = 0

  financeStore.savingGoals.forEach((saving) => {
    if (saving.currency === 'USD') {
      const valueInUSD = saving.currentAmount
      const valueInVES = saving.currentAmount * rate.value
      totalUSD += valueInUSD
      totalVES += valueInVES
    } else {
      const valueInVES = saving.currentAmount
      const valueInUSD = rate.value > 0 ? saving.currentAmount / rate.value : 0
      totalVES += valueInVES
      totalUSD += valueInUSD
    }
  })

  return savingsDisplayCurrency.value === 'USD' ? totalUSD : totalVES
})

// Abrir modal de abono
const openContributeModal = (savingId: string) => {
  selectedSavingId.value = savingId
  contributeAmount.value = null
  contributeError.value = ''
  showContributeModal.value = true
}

// Guardar nuevo ahorro (REGLA: Sin validación de saldo disponible, crear meta no gasta dinero)
const handleCreateSaving = () => {
  if (!newSavingTitle.value.trim() || !newSavingTarget.value || newSavingTarget.value <= 0) {
    savingFormError.value = 'Por favor, completa todos los campos con valores válidos.'
    return
  }

  try {
    financeStore.addSavingGoal({
      title: newSavingTitle.value.trim(),
      targetAmount: Number(newSavingTarget.value),
      currency: newSavingCurrency.value
    })
    newSavingTitle.value = ''
    newSavingTarget.value = null
    showNewSavingModal.value = false
    savingFormError.value = ''
  } catch (error: any) {
    savingFormError.value = error.message || 'Error al crear el registro de ahorro.'
  }
}

// Procesar abono a ahorro (REGLA: Validación estricta contra totalBalance, ingreso exclusivo en Bs)
const handleContribute = () => {
  if (!selectedSavingId.value || contributeAmount.value === null || contributeAmount.value <= 0) {
    contributeError.value = 'Introduce un monto válido en Bolívares mayor a 0.'
    return
  }

  const amountInBs = Number(contributeAmount.value)

  // Validación estricta: el abono en Bs no puede superar el saldo general disponible del Dashboard
  if (amountInBs > financeStore.totalBalance) {
    contributeError.value = `Fondos insuficientes. El saldo disponible en cuentas es ${currencyStore.formatMoney(financeStore.totalBalance)}.`
    return
  }

  try {
    financeStore.contributeToGoal(
      selectedSavingId.value,
      amountInBs,
      rate.value
    )
    showContributeModal.value = false
    selectedSavingId.value = null
    contributeAmount.value = null
    contributeError.value = ''
  } catch (error: any) {
    contributeError.value = error.message || 'Error al procesar el abono.'
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden">
    
    <!-- HEADER -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs gap-3">
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          Ahorros y Capital
        </h1>
        <p class="text-xs sm:text-sm text-emerald-600 font-semibold truncate mt-0.5">
          Bienvenido a tus ahorros, {{ username }}
        </p>
      </div>
    </header>

    <!-- CONTENIDO DESPLAZABLE DE AHORROS -->
    <section class="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-5 custom-scrollbar">
      
      <!-- Bloque Superior: Tarjeta de Balance de Ahorros + Botón Nuevo Ahorro -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        <!-- Tarjeta Principal de Ahorros con Selector de Divisa -->
        <div class="lg:col-span-2 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <span class="text-[10px] sm:text-[11px] uppercase tracking-widest text-emerald-200 font-bold">Total Acumulado en Ahorros</span>
              
              <!-- Selector de moneda para la tarjeta -->
              <div class="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20">
                <button
                  @click="savingsDisplayCurrency = 'USD'"
                  :class="['px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer', savingsDisplayCurrency === 'USD' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white']"
                >
                  USD ($)
                </button>
                <button
                  @click="savingsDisplayCurrency = 'VES'"
                  :class="['px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer', savingsDisplayCurrency === 'VES' ? 'bg-white text-emerald-800 shadow-sm' : 'text-emerald-100 hover:text-white']"
                >
                  VES (Bs.)
                </button>
              </div>
            </div>

            <h2 class="text-2xl xs:text-3xl sm:text-4xl font-black mt-3 tracking-tight break-all text-white">
              {{ savingsDisplayCurrency === 'USD' ? '$' : 'Bs. ' }}{{ convertedTotalSavings.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </h2>
          </div>

          <div class="mt-5 pt-3.5 border-t border-white/10 relative z-10 flex items-center justify-between text-[11px] text-emerald-200 font-medium">
            <span>Ahorros activos: <strong class="text-white">{{ financeStore.savingGoals.filter(g => !g.isCompleted).length }}</strong></span>
            <span class="text-emerald-300 font-semibold">Resguardo Financiero</span>
          </div>
        </div>

        <!-- Tarjeta de Acción Rápida: Nuevo Ahorro -->
        <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Gestión de Ahorros</h3>
            <p class="text-xs text-slate-500 mt-1">Crea un nuevo fondo de ahorro o abona saldo para incrementar tu patrimonio.</p>
          </div>
          <button
            @click="showNewSavingModal = true"
            class="w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Nuevo Ahorro
          </button>
        </div>

      </div>

      <!-- LISTADO DE AHORROS CON BARRA DE PROGRESO ESMERALDA -->
      <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Mis Fondos de Ahorro</h3>
          <span class="text-[11px] font-medium text-slate-400">{{ financeStore.savingGoals.length }} registrados</span>
        </div>

        <div v-if="financeStore.savingGoals.length === 0" class="text-center py-10 text-slate-400 text-xs font-medium">
          No tienes fondos de ahorro configurados. ¡Crea uno para comenzar!
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="saving in financeStore.savingGoals"
            :key="saving.id"
            class="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100/80 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-emerald-300 transition-all"
          >
            <!-- Indicador de completado -->
            <div v-if="saving.isCompleted" class="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>✓ Completado</span>
            </div>

            <div>
              <div class="flex items-start justify-between pr-16">
                <h4 class="text-sm font-bold text-slate-900">{{ saving.title }}</h4>
              </div>
              <div class="flex items-baseline gap-1.5 mt-1">
                <span class="text-lg font-black text-emerald-800">
                  {{ saving.currency === 'USD' ? '$' : 'Bs. ' }}{{ saving.currentAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
                </span>
                <span class="text-xs text-slate-400 font-medium">
                  / {{ saving.currency === 'USD' ? '$' : 'Bs. ' }}{{ saving.targetAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>

            <!-- Barra de Progreso Esmeralda -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Progreso</span>
                <span>{{ Math.min(100, Math.round((saving.currentAmount / saving.targetAmount) * 100)) }}%</span>
              </div>
              <div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(100, (saving.currentAmount / saving.targetAmount) * 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center justify-between pt-2 border-t border-emerald-100/60">
              <button
                @click="financeStore.deleteSavingGoal(saving.id)"
                class="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Eliminar ahorro
              </button>
              <button
                v-if="!saving.isCompleted"
                @click="openContributeModal(saving.id)"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                + Abonar fondos
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- HISTORIAL DE APORTES A AHORROS -->
      <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Historial de Aportes a Ahorros</h3>
          <span class="text-[11px] font-medium text-slate-400">Bitácora exclusiva</span>
        </div>

        <div v-if="financeStore.savingContributions.length === 0" class="text-center py-6 text-slate-400 text-xs">
          No hay abonos registrados en ningún fondo de ahorro todavía.
        </div>

        <div v-else class="max-h-[260px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div
            v-for="contrib in financeStore.savingContributions"
            :key="contrib.id"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-100 text-xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                $
              </div>
              <div class="min-w-0">
                <p class="font-bold text-slate-800 truncate">
                  Aporte a ahorro &bull; <span class="text-emerald-700">{{ financeStore.savingGoals.find(g => g.id === contrib.goalId)?.title || 'Ahorro eliminado' }}</span>
                </p>
                <p class="text-[10px] text-slate-400">{{ new Date(contrib.date).toLocaleDateString('es-VE', { dateStyle: 'medium' }) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="font-extrabold text-emerald-600">
                - Bs. {{ contrib.amountInBaseCurrency.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
              </span>
              <button
                @click="financeStore.deleteSavingContribution(contrib.id)"
                class="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Eliminar aporte"
              >
                <span class="text-xs font-bold leading-none">✕</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- MODAL: NUEVO AHORRO -->
    <div v-if="showNewSavingModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4">
        <header class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Crear Nuevo Fondo de Ahorro</h3>
          <button @click="showNewSavingModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1">✕</button>
        </header>

        <div v-if="savingFormError" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          {{ savingFormError }}
        </div>

        <form @submit.prevent="handleCreateSaving" class="space-y-3.5">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-600">Título del Ahorro</label>
            <input
              v-model="newSavingTitle"
              type="text"
              placeholder="Ej. Fondo de emergencia, Inversión..."
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-600">Moneda</label>
              <select
                v-model="newSavingCurrency"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
              >
                <option value="USD">Dólares ($)</option>
                <option value="VES">Bolívares (Bs.)</option>
              </select>
            </div>

            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-600">Monto Objetivo</label>
              <input
                v-model.number="newSavingTarget"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
                required
              />
            </div>
          </div>

          <div class="flex gap-2.5 pt-3">
            <button
              type="button"
              @click="showNewSavingModal = false"
              class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Guardar Ahorro
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: ABONAR FONDOS (Solo Bolívares) -->
    <div v-if="showContributeModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4">
        <header class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Abonar al Fondo de Ahorro</h3>
          <button @click="showContributeModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1">✕</button>
        </header>

        <div v-if="contributeError" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          {{ contributeError }}
        </div>

        <form @submit.prevent="handleContribute" class="space-y-3.5">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-600">Monto a Abonar (en Bolívares - Bs.)</label>
            <input
              v-model.number="contributeAmount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-emerald-600"
              required
            />
          </div>

          <p class="text-[11px] text-slate-400">
            * Si el fondo fue creado en Dólares ($), el sistema convertirá tu abono en Bs a su equivalente usando la tasa BCV actual. (Saldo en cuentas: {{ currencyStore.formatMoney(financeStore.totalBalance) }}).
          </p>

          <div class="flex gap-2.5 pt-3">
            <button
              type="button"
              @click="showContributeModal = false"
              class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Confirmar Abono
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
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