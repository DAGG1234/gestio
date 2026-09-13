<!-- src/views/DebtsView.vue -->
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
const showNewDebtModal = ref(false)
const showPayModal = ref(false)
const selectedDebtId = ref<string | null>(null)

// Campos del formulario de Nueva Deuda
const newDebtTitle = ref('')
const newDebtTotal = ref<number | null>(null)
const newDebtCurrency = ref<'USD' | 'VES'>('USD')
const debtFormError = ref('')

// Campos del formulario de Pagar/Abonar (Únicamente en Bolívares)
const payAmount = ref<number | null>(null)
const payError = ref('')

// Selector de moneda específico para la tarjeta de balance de deudas ($ or Bs)
const debtsDisplayCurrency = ref<'USD' | 'VES'>('USD')

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

// Balance total pendiente en deudas convertido dinámicamente según la moneda de visualización
const convertedTotalDebt = computed(() => {
  let totalUSD = 0
  let totalVES = 0

  financeStore.debtGoals.forEach((debt) => {
    if (debt.currency === 'USD') {
      const valueInUSD = debt.remainingAmount
      const valueInVES = debt.remainingAmount * rate.value
      totalUSD += valueInUSD
      totalVES += valueInVES
    } else {
      const valueInVES = debt.remainingAmount
      const valueInUSD = rate.value > 0 ? debt.remainingAmount / rate.value : 0
      totalVES += valueInVES
      totalUSD += valueInUSD
    }
  })

  return debtsDisplayCurrency.value === 'USD' ? totalUSD : totalVES
})

// Abrir modal de pago
const openPayModal = (debtId: string) => {
  selectedDebtId.value = debtId
  payAmount.value = null
  payError.value = ''
  showPayModal.value = true
}

const handleNewDebtInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let val = target.value

  if (val === '') {
    newDebtTotal.value = null
    debtFormError.value = ''
    return
  }

  const num = parseFloat(val)
  const MAX_LIMIT = 999999999.99

  if (num > MAX_LIMIT) {
    debtFormError.value = `El monto máximo permitido es ${MAX_LIMIT.toLocaleString()}`
    newDebtTotal.value = MAX_LIMIT
    return
  }

  if (val.includes('.')) {
    const parts = val.split('.')
    if (parts[1] && parts[1].length > 2) {
      newDebtTotal.value = parseFloat(Number(val).toFixed(2))
      return
    }
  }

  debtFormError.value = ''
  newDebtTotal.value = num
}

const handlePayAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let val = target.value

  if (val === '') {
    payAmount.value = null
    payError.value = ''
    return
  }

  const num = parseFloat(val)
  const MAX_LIMIT = 999999999.99

  if (num > MAX_LIMIT) {
    payError.value = `El monto máximo permitido es ${MAX_LIMIT.toLocaleString()}`
    payAmount.value = MAX_LIMIT
    return
  }

  if (val.includes('.')) {
    const parts = val.split('.')
    if (parts[1] && parts[1].length > 2) {
      payAmount.value = parseFloat(Number(val).toFixed(2))
      return
    }
  }

  payError.value = ''
  payAmount.value = num
}

// Guardar nueva deuda (REGLA: Sin validación de saldo disponible, registrar deuda no gasta dinero en el acto)
const handleCreateDebt = () => {
  if (!newDebtTitle.value.trim() || newDebtTotal.value === null || newDebtTotal.value <= 0) {
    debtFormError.value = 'Por favor, completa todos los campos con valores válidos.'
    return
  }

  try {
    financeStore.addDebtGoal({
      title: newDebtTitle.value.trim(),
      totalAmount: Number(newDebtTotal.value),
      currency: newDebtCurrency.value
    })
    newDebtTitle.value = ''
    newDebtTotal.value = null
    showNewDebtModal.value = false
    debtFormError.value = ''
  } catch (error: any) {
    debtFormError.value = error.message || 'Error al registrar la deuda.'
  }
}

// Procesar abono a deuda (REGLA: Validación estricta contra totalBalance, ingreso exclusivo en Bs)
const handlePayDebt = () => {
  if (!selectedDebtId.value || payAmount.value === null || payAmount.value <= 0) {
    payError.value = 'Introduce un monto válido en Bolívares mayor a 0.'
    return
  }

  const amountInBs = Number(payAmount.value)

  // Validación estricta: el abono en Bs no puede superar el saldo general disponible del Dashboard
  if (amountInBs > financeStore.totalBalance) {
    payError.value = `Fondos insuficientes. El saldo disponible en cuentas es ${currencyStore.formatMoney(financeStore.totalBalance)}.`
    return
  }

  try {
    financeStore.payDebt(
      selectedDebtId.value,
      amountInBs,
      rate.value
    )
    showPayModal.value = false
    selectedDebtId.value = null
    payAmount.value = null
    payError.value = ''
  } catch (error: any) {
    payError.value = error.message || 'Error al procesar el pago.'
  }
}
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
    
    <!-- HEADER -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs gap-3">
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          Deudas y Compromisos
        </h1>
        <p class="text-xs sm:text-sm text-rose-600 font-semibold truncate mt-0.5">
          Control de pasivos, {{ username }}
        </p>
      </div>
    </header>

    <!-- CONTENIDO DESPLAZABLE DE DEUDAS -->
    <section class="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-5 custom-scrollbar">
      
      <!-- Bloque Superior: Tarjeta de Balance de Deudas + Botón Nueva Deuda -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        
        <!-- Tarjeta Principal de Deudas con Selector de Divisa -->
        <div class="lg:col-span-2 bg-gradient-to-br from-rose-700 via-rose-800 to-red-950 text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
          
          <div class="relative z-10">
            <div class="flex items-center justify-between">
              <span class="text-[10px] sm:text-[11px] uppercase tracking-widest text-rose-200 font-bold">Total Pendiente por Pagar</span>
              
              <!-- Selector de moneda para la tarjeta -->
              <div class="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/20">
                <button
                  @click="debtsDisplayCurrency = 'USD'"
                  :class="['px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer', debtsDisplayCurrency === 'USD' ? 'bg-white text-rose-900 shadow-sm' : 'text-rose-100 hover:text-white']"
                >
                  USD ($)
                </button>
                <button
                  @click="debtsDisplayCurrency = 'VES'"
                  :class="['px-2.5 py-1 text-[10px] font-bold rounded-md transition-all cursor-pointer', debtsDisplayCurrency === 'VES' ? 'bg-white text-rose-900 shadow-sm' : 'text-rose-100 hover:text-white']"
                >
                  VES (Bs.)
                </button>
              </div>
            </div>

            <h2 class="text-2xl xs:text-3xl sm:text-4xl font-black mt-3 tracking-tight break-all text-white">
              {{ debtsDisplayCurrency === 'USD' ? '$' : 'Bs. ' }}{{ convertedTotalDebt.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
            </h2>
          </div>

          <div class="mt-5 pt-3.5 border-t border-white/10 relative z-10 flex items-center justify-between text-[11px] text-rose-200 font-medium">
            <span>Deudas activas: <strong class="text-white">{{ financeStore.debtGoals.filter(d => !d.isPaidOff).length }}</strong></span>
            <span class="text-rose-300 font-semibold">Compromisos Financieros</span>
          </div>
        </div>

        <!-- Tarjeta de Acción Rápida: Nueva Deuda -->
        <div class="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Gestión de Pasivos</h3>
            <p class="text-xs text-slate-500 mt-1">Registra nuevos compromisos de pago o abona saldos para cancelar deudas.</p>
          </div>
          <button
            @click="showNewDebtModal = true"
            class="w-full mt-4 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
            Nueva Deuda
          </button>
        </div>

      </div>

      <!-- LISTADO DE DEUDAS CON BARRA DE PROGRESO DE PAGO -->
      <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Mis Compromisos Registrados</h3>
          <span class="text-[11px] font-medium text-slate-400">{{ financeStore.debtGoals.length }} registradas</span>
        </div>

        <div v-if="financeStore.debtGoals.length === 0" class="text-center py-10 text-slate-400 text-xs font-medium">
          No tienes deudas registradas. ¡Estás al día!
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="debt in financeStore.debtGoals"
            :key="debt.id"
            class="p-4 rounded-2xl bg-rose-50/40 border border-rose-100/80 flex flex-col justify-between gap-3 relative overflow-hidden group hover:border-rose-300 transition-all"
          >
            <!-- Indicador de pagado -->
            <div v-if="debt.isPaidOff" class="absolute top-3 right-3 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1">
              <span>✓ Pagada</span>
            </div>

            <div>
              <div class="flex items-start justify-between pr-16">
                <h4 class="text-sm font-bold text-slate-900">{{ debt.title }}</h4>
              </div>
              <div class="flex items-baseline gap-1.5 mt-1">
                <span class="text-lg font-black text-rose-800">
                  Pendiente: {{ debt.currency === 'USD' ? '$' : 'Bs. ' }}{{ debt.remainingAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
                </span>
                <span class="text-xs text-slate-400 font-medium">
                  / Total: {{ debt.currency === 'USD' ? '$' : 'Bs. ' }}{{ debt.totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>

            <!-- Barra de Progreso de Cancelación -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-bold text-slate-600">
                <span>Cancelado</span>
                <span>{{ Math.min(100, Math.round(((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100)) }}%</span>
              </div>
              <div class="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-rose-500 to-red-600 rounded-full transition-all duration-500"
                  :style="{ width: `${Math.min(100, ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100)}%` }"
                ></div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center justify-between pt-2 border-t border-rose-100/60">
              <button
                @click="financeStore.deleteDebtGoal(debt.id)"
                class="text-xs font-semibold text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
              >
                Eliminar deuda
              </button>
              <button
                v-if="!debt.isPaidOff"
                @click="openPayModal(debt.id)"
                class="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                Pagar / Abonar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- HISTORIAL DE PAGOS A DEUDAS -->
      <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Historial de Pagos de Deudas</h3>
          <span class="text-[11px] font-medium text-slate-400">Bitácora exclusiva</span>
        </div>

        <div v-if="financeStore.debtPayments.length === 0" class="text-center py-6 text-slate-400 text-xs">
          No hay pagos registrados en ninguna deuda todavía.
        </div>

        <div v-else class="max-h-[260px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          <div
            v-for="payment in financeStore.debtPayments"
            :key="payment.id"
            class="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/60 border border-slate-100 text-xs"
          >
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center font-bold text-xs shrink-0">
                $
              </div>
              <div class="min-w-0">
                <p class="font-bold text-slate-800 truncate">
                  Pago a deuda &bull; <span class="text-rose-700">{{ financeStore.debtGoals.find(d => d.id === payment.debtId)?.title || 'Deuda eliminada' }}</span>
                </p>
                <p class="text-[10px] text-slate-400">{{ payment.date.split('T')[0].split('-').reverse().join('/') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="font-extrabold text-rose-600">
                - Bs. {{ payment.amountInBaseCurrency.toLocaleString('es-VE', { minimumFractionDigits: 2 }) }}
              </span>
              <button
                @click="financeStore.deleteDebtPayment(payment.id)"
                class="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Eliminar pago"
              >
                <span class="text-xs font-bold leading-none">✕</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </section>

    <!-- MODAL: NUEVA DEUDA -->
    <div v-if="showNewDebtModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4">
        <header class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Registrar Nueva Deuda</h3>
          <button @click="showNewDebtModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1">✕</button>
        </header>

        <div v-if="debtFormError" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          {{ debtFormError }}
        </div>

        <form @submit.prevent="handleCreateDebt" class="space-y-3.5">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-600">Título de la Deuda</label>
            <input
              v-model="newDebtTitle"
              type="text"
              maxlength="50"
              placeholder="Ej. Préstamo bancario, Tarjeta de crédito..."
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-600"
              required
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <label class="block text-xs font-bold text-slate-600">Moneda</label>
              <select
                v-model="newDebtCurrency"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-600"
              >
                <option value="USD">Dólares ($)</option>
                <option value="VES">Bolívares (Bs.)</option>
              </select>
            </div>

            <div class="space-y-1">
              <div class="flex justify-between items-center">
                <label class="block text-xs font-bold text-slate-600">Monto Total</label>
                <span class="text-[9px] text-slate-400">Máx: 999M</span>
              </div>
              <input
                :value="newDebtTotal"
                @input="handleNewDebtInput"
                type="number"
                step="0.01"
                min="0.01"
                max="999999999.99"
                placeholder="0.00"
                class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-600"
                required
              />
            </div>
          </div>

          <div class="flex gap-2.5 pt-3">
            <button
              type="button"
              @click="showNewDebtModal = false"
              class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Registrar Deuda
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL: PAGAR / ABONAR DEUDA (Solo Bolívares) -->
    <div v-if="showPayModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4">
        <header class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900">Abonar o Pagar a la Deuda</h3>
          <button @click="showPayModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1">✕</button>
        </header>

        <div v-if="payError" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
          {{ payError }}
        </div>

        <form @submit.prevent="handlePayDebt" class="space-y-3.5">
          <div class="space-y-1">
            <div class="flex justify-between items-center">
              <label class="block text-xs font-bold text-slate-600">Monto a Pagar (en Bolívares - Bs.)</label>
              <span class="text-[9px] text-slate-400">Máx: 999M</span>
            </div>
            <input
              :value="payAmount"
              @input="handlePayAmountInput"
              type="number"
              step="0.01"
              min="0.01"
              max="999999999.99"
              placeholder="0.00"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-rose-600"
              required
            />
          </div>

          <p class="text-[11px] text-slate-400">
            * Si la deuda fue creada en Dólares ($), el sistema convertirá tu pago en Bs a su equivalente usando la tasa BCV actual. (Saldo en cuentas: {{ currencyStore.formatMoney(financeStore.totalBalance) }}).
          </p>

          <div class="flex gap-2.5 pt-3">
            <button
              type="button"
              @click="showPayModal = false"
              class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Confirmar Pago
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