<!-- src/views/DashboardView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { useCategoryStore } from '@/stores/useCategoryStore'
import { useExchangeRateStore } from '@/stores/useExchangeRateStore'
import { useCurrencyToggle } from '@/stores/useCurrencyToggle'
import IncomeExpenseChart from '@/components/BalanceChart.vue'

const authStore = useAuthStore()
const financeStore = useFinanceStore()
const categoryStore = useCategoryStore()
const exchangeRateStore = useExchangeRateStore()
const currencyStore = useCurrencyToggle()

const activeModal = ref<'income' | 'expense' | null>(null)
const showAllModal = ref<boolean>(false)
const category = ref<string>('')
const description = ref<string>('')
const amount = ref<number | null>(null)
const formError = ref<string>('')

// Nombre formateado con la primera letra en mayúscula
const username = computed(() => {
  const rawName = authStore.user?.username || 'Daniel'
  return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
})

// Saludo dinámico basado en la hora del sistema (sin iconos)
const greetingMessage = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos días'
  if (hour >= 12 && hour < 19) return 'Buenas tardes'
  return 'Buenas noches'
})

onMounted(async () => {
  exchangeRateStore.fetchExchangeRate()
  // Carga los datos financieros y transacciones desde Supabase al montar la vista
  await financeStore.fetchAllData()
})

const recentTransactions = computed(() => {
  return financeStore.transactions.slice(0, 10)
})

// Validación en tiempo real para verificar si el egreso excede el balance actual
const exceedsBalance = computed(() => {
  if (activeModal.value === 'expense' && amount.value !== null) {
    const currentBalanceInViewCurrency = currencyStore.currentCurrency === 'USD' 
      ? (exchangeRateStore.rate > 0 ? financeStore.totalBalance / exchangeRateStore.rate : 0)
      : financeStore.totalBalance

    return amount.value > currentBalanceInViewCurrency
  }
  return false
})

const openModal = (type: 'income' | 'expense') => {
  activeModal.value = type
  category.value = type === 'income' ? categoryStore.incomeCategories[0] : categoryStore.expenseCategories[0]
  description.value = ''
  amount.value = null
  formError.value = ''
}

const closeModal = () => {
  activeModal.value = null
  formError.value = ''
}

const handleAmountInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  let val = target.value

  if (val === '') {
    amount.value = null
    formError.value = ''
    return
  }

  const num = parseFloat(val)
  const MAX_LIMIT = 999999999.99

  if (num > MAX_LIMIT) {
    formError.value = `El monto máximo permitido es ${MAX_LIMIT.toLocaleString()}`
    amount.value = MAX_LIMIT
    return
  }

  if (val.includes('.')) {
    const parts = val.split('.')
    if (parts[1] && parts[1].length > 2) {
      amount.value = parseFloat(Number(val).toFixed(2))
      return
    }
  }

  formError.value = ''
  amount.value = num
}

const handleAddTransaction = () => {
  if (amount.value === null || amount.value <= 0) {
    formError.value = 'Por favor, introduce un monto válido mayor a 0.'
    return
  }

  if (!description.value.trim()) {
    formError.value = 'La descripción es obligatoria.'
    return
  }

  // Validación previa al enviar si es egreso
  if (activeModal.value === 'expense' && exceedsBalance.value) {
    formError.value = 'No puedes registrar un egreso superior a tu saldo disponible.'
    return
  }

  // Si está en USD, convertimos el monto a la moneda base (Bolívares) para guardarlo correctamente en la store
  let amountToSave = Number(amount.value)
  if (currencyStore.currentCurrency === 'USD') {
    amountToSave = amountToSave * exchangeRateStore.rate
  }

  try {
    financeStore.addTransaction({
      type: activeModal.value!,
      category: category.value,
      description: description.value.trim(),
      amount: amountToSave
    })
    closeModal()
  } catch (error: any) {
    formError.value = error.message || 'Error al procesar la transacción.'
  }
}

const handleDeleteTransaction = (id: string, event: Event) => {
  event.stopPropagation()
  financeStore.deleteTransaction(id)
}
</script>

<template>
  <!-- Se añadió 'bg-slate-50' para que el fondo general cubra el espacio vacío -->
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
    
    <!-- HEADER EJECUTIVO MINIMALISTA -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs gap-3">
      
      <!-- Título y Mensaje de Bienvenida Ampliados -->
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          Dashboard
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5">
          {{ greetingMessage }} {{ username }}, bienvenido
        </p>
      </div>

      <!-- Controles de Divisa y Tasa BCV -->
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          @click="currencyStore.toggleCurrency()"
          class="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-2.5 sm:px-3.5 py-1.5 rounded-xl border border-slate-200 text-[11px] sm:text-xs font-extrabold text-slate-700 transition-all cursor-pointer active:scale-95 shadow-2xs"
          :title="currencyStore.currentCurrency === 'VES' ? 'Cambiar a Dólares' : 'Cambiar a Bolívares'"
        >
          <span class="text-xs">{{ currencyStore.currentCurrency === 'VES' ? '🇻🇪' : '🇺🇸' }}</span>
          <div class="flex items-center gap-1">
            <span class="tracking-tight">{{ currencyStore.currentCurrency === 'VES' ? 'Bs.' : 'USD' }}</span>
            <span class="text-[10px] text-slate-400 font-medium">
              &rarr; {{ currencyStore.currentCurrency === 'VES' ? '$' : 'Bs' }}
            </span>
          </div>
        </button>

        <div class="hidden xs:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">BCV:</span>
          <span class="text-[11px] sm:text-xs font-extrabold text-slate-900">
            {{ exchangeRateStore.loading ? '...' : `${exchangeRateStore.rate.toFixed(2)}` }}
          </span>
        </div>
      </div>
    </header>

    <!-- Contenido Principal del Dashboard -->
    <section class="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 custom-scrollbar">
      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div class="flex flex-col gap-3.5 sm:gap-4">
          
          <div class="bg-gradient-to-br from-[#0b4d6c] via-[#093d56] to-[#073044] text-white p-5 sm:p-6 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
            <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none"></div>
            
            <div class="relative z-10">
              <div class="flex items-center justify-between">
                <span class="text-[10px] sm:text-[11px] uppercase tracking-widest text-slate-300 font-bold">Balance General</span>
                <span class="text-[10px] bg-white/10 px-2 py-0.5 rounded-md font-semibold text-slate-200">
                  {{ currencyStore.currentCurrency }}
                </span>
              </div>
              <h2 class="text-2xl xs:text-3xl sm:text-4xl font-black mt-2 tracking-tight break-all text-white">
                {{ currencyStore.formatMoney(financeStore.totalBalance) }}
              </h2>
            </div>
            <div class="mt-4 pt-3.5 border-t border-white/10 relative z-10 flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span>Disponible en cuentas</span>
              <span class="text-emerald-400 font-semibold">Activo</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
            <button
              @click="openModal('income')"
              class="py-2.5 sm:py-3 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <div class="w-4.5 h-4.5 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
              </div>
              Ingreso
            </button>
            <button
              @click="openModal('expense')"
              class="py-2.5 sm:py-3 px-3 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              <div class="w-4.5 h-4.5 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"/></svg>
              </div>
              Egreso
            </button>
          </div>
        </div>

        <div class="lg:col-span-2">
          <IncomeExpenseChart :income="financeStore.totalIncome" :expense="financeStore.totalExpense" />
        </div>
      </div>

      <div class="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div class="flex items-center justify-between mb-3.5">
          <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">Historial de Transacciones</h3>
          <span class="text-[11px] font-medium text-slate-400">Mostrando hasta 10 movimientos</span>
        </div>

        <div v-if="financeStore.transactions.length === 0" class="text-center py-8 sm:py-10 text-slate-400 text-xs font-medium">
          No hay movimientos registrados todavía.
        </div>

        <div v-else class="max-h-[340px] overflow-y-auto pr-1 space-y-2 custom-scrollbar">
          <div
            v-for="t in recentTransactions"
            :key="t.id"
            class="flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-slate-50/60 border border-slate-100/80 hover:bg-slate-100/50 transition-colors gap-2 sm:gap-3 group"
          >
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div :class="['w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs', t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600']">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="t.type === 'income'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-800 truncate">{{ t.description }}</p>
                <p class="text-[10px] text-slate-400 font-medium truncate">{{ t.category }} &bull; {{ t.date.split('T')[0].split('-').reverse().join('/') }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <span :class="['text-xs font-extrabold', t.type === 'income' ? 'text-emerald-600' : 'text-rose-600']">
                {{ t.type === 'income' ? '+' : '-' }}{{ currencyStore.formatMoney(t.amount) }}
              </span>

              <button
                @click="(e) => handleDeleteTransaction(t.id, e)"
                class="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Eliminar transacción"
              >
                <span class="text-xs font-bold leading-none">✕</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="financeStore.transactions.length > 0" class="mt-3.5 pt-3 border-t border-slate-100 text-center">
          <button
            @click="showAllModal = true"
            class="text-xs font-bold text-[#0b4d6c] hover:text-[#093d56] transition-colors cursor-pointer py-1 px-3"
          >
            Todos los movimientos &rarr;
          </button>
        </div>
      </div>

    </section>

    <!-- MODAL DE NUEVA TRANSACCIÓN -->
    <div v-if="activeModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
        <header class="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 class="text-sm font-bold text-slate-900 capitalize">
            Nuevo {{ activeModal === 'income' ? 'Ingreso' : 'Egreso' }}
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1">✕</button>
        </header>

        <!-- Alerta de Error o Exceso de Saldo -->
        <div v-if="formError || exceedsBalance" class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
          <svg class="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          <span>{{ formError || `El monto ingresado supera tu saldo disponible (${currencyStore.formatMoney(financeStore.totalBalance)}).` }}</span>
        </div>

        <form @submit.prevent="handleAddTransaction" class="space-y-3.5">
          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-600">Categoría</label>
            <select
              v-model="category"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#0b4d6c]"
            >
              <template v-if="activeModal === 'income'">
                <option v-for="cat in categoryStore.incomeCategories" :key="cat" :value="cat">{{ cat }}</option>
              </template>
              <template v-else>
                <option v-for="cat in categoryStore.expenseCategories" :key="cat" :value="cat">{{ cat }}</option>
              </template>
            </select>
          </div>

          <div class="space-y-1">
            <label class="block text-xs font-bold text-slate-600">Descripción</label>
            <input
              v-model="description"
              type="text"
              maxlength="50"
              placeholder="Ej. Pago de servicios"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#0b4d6c]"
              required
            />
          </div>

          <div class="space-y-1">
            <div class="flex justify-between items-center">
              <label class="block text-xs font-bold text-slate-600">Monto ({{ currencyStore.currentCurrency }})</label>
              <span class="text-[10px] text-slate-400">Máx: 999,999,999.99</span>
            </div>
            <input
              :value="amount"
              @input="handleAmountInput"
              type="number"
              step="0.01"
              min="0.01"
              max="999999999.99"
              placeholder="0.00"
              class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-[#0b4d6c]"
              required
            />
          </div>

          <div class="flex gap-2.5 pt-3">
            <button
              type="button"
              @click="closeModal"
              class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="exceedsBalance"
              :class="['w-1/2 py-2.5 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer', exceedsBalance ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#0b4d6c] hover:bg-[#093d56] text-white']"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL DE HISTORIAL COMPLETO -->
    <div v-if="showAllModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        <header class="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <h3 class="text-sm font-bold text-slate-900">Historial Completo</h3>
          <button @click="showAllModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer p-1">✕</button>
        </header>

        <div class="space-y-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
          <div
            v-for="t in financeStore.transactions"
            :key="t.id"
            class="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50/60 border border-slate-100 gap-2 sm:gap-3"
          >
            <div class="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div :class="['w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 shadow-2xs', t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600']">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="t.type === 'income'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                </svg>
              </div>
              <div class="min-w-0">
                <p class="text-xs font-bold text-slate-800 truncate">{{ t.description }}</p>
                <p class="text-[10px] text-slate-400 font-medium truncate">{{ t.category }} &bull; {{ t.date.split('T')[0].split('-').reverse().join('/') }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0">
              <span :class="['text-xs font-extrabold', t.type === 'income' ? 'text-emerald-600' : 'text-rose-600']">
                {{ t.type === 'income' ? '+' : '-' }}{{ currencyStore.formatMoney(t.amount) }}
              </span>

              <button
                @click="(e) => handleDeleteTransaction(t.id, e)"
                class="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer"
                title="Eliminar transacción"
              >
                <span class="text-xs font-bold leading-none">✕</span>
              </button>
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100 text-center shrink-0">
          <button
            @click="showAllModal = false"
            class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
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