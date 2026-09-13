<!-- src/views/FinancialHealthView.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useFinanceStore } from '@/stores/useFinanceStore'
import RiveDogPet from '@/components/pet/RiveDogPet.vue'
import PetDialog from '@/components/pet/PetDialog.vue'

const financeStore = useFinanceStore()
const affectionCounter = ref(Number(localStorage.getItem('gestio_pet_affection')) || 64)
const petName = ref(localStorage.getItem('gestio_pet_name') || 'Kiki')

// Modal de bienvenida para nuevos usuarios
const showSetupModal = ref(false)
const inputPetName = ref('')

onMounted(() => {
  const savedName = localStorage.getItem('gestio_pet_name')
  if (!savedName || savedName.trim() === '') {
    showSetupModal.value = true
  }
})

const handleSavePetName = () => {
  if (inputPetName.value.trim()) {
    petName.value = inputPetName.value.trim()
    localStorage.setItem('gestio_pet_name', petName.value)
    showSetupModal.value = false
  }
}

const handlePetCaress = () => {
  affectionCounter.value += 1
  localStorage.setItem('gestio_pet_affection', affectionCounter.value.toString())
}

// Saber si el usuario no ha registrado nada todavía
const hasNoTransactions = computed(() => {
  return (financeStore.totalIncome || 0) === 0 && (financeStore.totalExpense || 0) === 0
})

// 1. Cálculo realista del porcentaje
const healthPercentage = computed(() => {
  if (hasNoTransactions.value) return 0

  const totalIncome = financeStore.totalIncome || 1
  const totalExpense = financeStore.totalExpense || 0
  
  if (totalExpense >= totalIncome) return 0
  const remainingRatio = (totalIncome - totalExpense) / totalIncome
  return Math.min(Math.max(Math.round(remainingRatio * 100), 0), 100)
})

// 2. Sincronizar el "mood" de Kiki
const dynamicMood = computed(() => {
  if (hasNoTransactions.value) return 'neutral'

  const hp = healthPercentage.value
  if (hp >= 80) return 'happy'    
  if (hp >= 50) return 'neutral'   
  if (hp >= 30) return 'sad'      
  return 'sad'                    
})

// 3. Consejos y alertas variadas
const dynamicAdvice = computed(() => {
  const name = typeof petName.value === 'string' ? petName.value : 'Kiki'

  if (hasNoTransactions.value) {
    return {
      title: 'Comienza tu Registro',
      message: `¡Hola! Todavía no tienes ingresos ni egresos registrados. Comienza a agregarlos para que ${name} pueda evaluar y cuidar de tus finanzas.`
    }
  }

  const hp = healthPercentage.value

  if (hp >= 90) {
    return {
      title: 'Excelente Gestión',
      message: `¡Guau! Tus finanzas están impecables. Tienes un margen de ahorro excelente y ${name} está saltando de la alegría. ¡Sigue así!`
    }
  } else if (hp >= 70) {
    return {
      title: 'Muy Buen Ritmo',
      message: `Estás administrando muy bien tus ingresos. Los gastos están bajo control y ${name} se siente seguro y feliz a tu lado.`
    }
  } else if (hp >= 50) {
    return {
      title: 'Finanzas Estables',
      message: `Vas por buen camino, pero mantén el ojo en los gastos hormiga. ${name} vigila de cerca el presupuesto para evitar sorpresas.`
    }
  } else if (hp >= 30) {
    return {
      title: 'Zona de Precaución',
      message: `¡Cuidado, ${name} está un poco triste! Los egresos están creciendo bastante en relación a tus ingresos. Es hora de recortar gastos innecesarios.`
    }
  } else {
    return {
      title: 'Alerta Roja Financiera',
      message: `¡Tus gastos han superado el límite saludable! ${name} está muy preocupado. Tus finanzas necesitan un ajuste de emergencia de inmediato.`
    }
  }
})
</script>

<template>
  <main class="flex-1 h-screen bg-slate-50/50 p-4 overflow-hidden flex flex-col items-center justify-center relative">
    
    <!-- Modal de bienvenida para bautizar a la mascota si es primera vez -->
    <div v-if="showSetupModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
        <div class="w-16 h-16 bg-pink-50 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-inner">🐶</div>
        <h3 class="text-lg font-black text-slate-800">¡Bienvenido a Gestio!</h3>
        <p class="text-xs text-slate-500 mt-1 mb-5">Tu perrito guardián te acompañará a cuidar tus finanzas. ¿Cómo te gustaría llamarlo?</p>
        
        <input 
          v-model="inputPetName" 
          type="text" 
          maxlength="15" 
          placeholder="Ej. Kiki, Firulais, Max..."
          class="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 text-center mb-4 focus:outline-none focus:border-pink-500 transition-colors"
          @keyup.enter="handleSavePetName"
          autofocus
        />
        
        <button 
          @click="handleSavePetName" 
          :disabled="!inputPetName.trim()"
          class="w-full bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-2xl shadow-lg shadow-pink-500/25 transition-all cursor-pointer active:scale-95"
        >
          ¡Comenzar Aventura! 🚀
        </button>
      </div>
    </div>

    <!-- Contenedor general -->
    <div class="w-full max-w-sm flex flex-col items-center justify-center gap-2">
      
      <!-- Barra de salud de la mascota -->
      <div class="w-full bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl px-4 py-3 shadow-sm flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            Salud de {{ petName }}
            <button @click="showSetupModal = true" class="text-[10px] text-pink-600 hover:underline font-bold cursor-pointer">(Cambiar)</button>
          </span>
          <span class="text-xs font-black" :class="{
            'text-slate-400': hasNoTransactions,
            'text-emerald-600': !hasNoTransactions && healthPercentage >= 70,
            'text-amber-600': !hasNoTransactions && healthPercentage >= 40 && healthPercentage < 70,
            'text-rose-600': !hasNoTransactions && healthPercentage < 40
          }">
            {{ hasNoTransactions ? 'Sin datos' : `${healthPercentage}%` }}
          </span>
        </div>
        
        <!-- Barra de progreso dinámica -->
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
          <div 
            class="h-full rounded-full transition-all duration-500"
            :class="{
              'w-0': hasNoTransactions,
              'bg-emerald-500 shadow-sm shadow-emerald-500/50': !hasNoTransactions && healthPercentage >= 70,
              'bg-amber-500 shadow-sm shadow-amber-500/50': !hasNoTransactions && healthPercentage >= 40 && healthPercentage < 70,
              'bg-rose-500 shadow-sm shadow-rose-500/50': !hasNoTransactions && healthPercentage < 40
            }"
            :style="{ width: hasNoTransactions ? '0%' : `${healthPercentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Perrito Kiki con expresión sincronizada -->
      <div class="w-full flex flex-col items-center">
        <RiveDogPet 
          :mood="dynamicMood"
          :petName="petName"
          :affectionCount="affectionCounter"
          @pet="handlePetCaress"
        />
      </div>

      <!-- Cuadro de diálogo financiero dinámico y variado -->
      <div class="w-full">
        <PetDialog 
          :title="dynamicAdvice.title"
          :message="dynamicAdvice.message"
          :mood="dynamicMood"
        />
      </div>

    </div>
  </main>
</template>