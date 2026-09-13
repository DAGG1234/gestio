<!-- src/components/finance/TransactionModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/useFinanceStore'

const emit = defineEmits<{
  (e: 'close'): void
}>()

const financeStore = useFinanceStore()

const type = ref<'income' | 'expense'>('expense')
const category = ref('Alimentación')
const description = ref('')
const amount = ref<number | null>(null)
const errorMessage = ref<string | null>(null)

// Validación computada para advertir (pero no bloquear) si excede el saldo
const exceedsBalance = computed(() => {
  if (type.value === 'expense' && amount.value !== null) {
    return amount.value > financeStore.totalBalance
  }
  return false
})

const handleSubmit = () => {
  errorMessage.value = null
  if (amount.value === null || amount.value <= 0) return

  try {
    financeStore.addTransaction({
      type: type.value,
      category: category.value,
      description: description.value || 'Gasto registrado',
      amount: amount.value
    })
    
    // Limpiar formulario y cerrar (o emitir cierre)
    amount.value = null
    description.value = ''
    emit('close')
  } catch (error: any) {
    errorMessage.value = error.message || 'Ocurrió un error al registrar la transacción.'
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm max-w-md mx-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">Nueva Transacción</h2>
      <button @click="emit('close')" class="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
    </div>

    <!-- Alerta visual de advertencia si excede el saldo (No bloqueante) -->
    <div v-if="exceedsBalance" class="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-start gap-2">
      <svg class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>
        <span>Atención: Este egreso supera tu saldo actual disponible (Bs. {{ financeStore.totalBalance.toFixed(2) }}).</span>
      </div>
    </div>

    <!-- Error crítico del sistema si lo hubiera -->
    <div v-if="errorMessage" class="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="text-xs font-bold text-slate-700 uppercase">Tipo</label>
        <select v-model="type" class="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500">
          <option value="income">Ingreso</option>
          <option value="expense">Egreso / Gasto</option>
        </select>
      </div>

      <div>
        <label class="text-xs font-bold text-slate-700 uppercase">Monto en Bolívares (Bs.)</label>
        <input 
          type="number" 
          v-model.number="amount" 
          step="any" 
          min="0"
          placeholder="0.00" 
          class="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      <div>
        <label class="text-xs font-bold text-slate-700 uppercase">Descripción</label>
        <input 
          type="text" 
          v-model="description" 
          placeholder="Ej. Supermercado, Pago de servicio..." 
          class="w-full mt-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
        />
      </div>

      <!-- Botón funcional habilitado siempre que haya un monto válido -->
      <button 
        type="submit"
        :disabled="!amount || amount <= 0"
        class="w-full py-3 rounded-xl font-bold text-xs uppercase transition-all shadow-xs cursor-pointer"
        :class="!amount || amount <= 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white'"
      >
        Registrar Movimiento
      </button>
    </form>
  </div>
</template>