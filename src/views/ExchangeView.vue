<!-- src/views/ExchangeView.vue -->
<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { useExchangeRateStore } from '@/stores/useExchangeRateStore'
import ExchangeCard from '@/components/exchange/ExchangeCard.vue'
import ExchangeTrendCard from '@/components/exchange/ExchangeTrendCard.vue'
import ExchangePresetsCard from '@/components/exchange/ExchangePresetsCard.vue'

const authStore = useAuthStore()
const exchangeStore = useExchangeRateStore()

onMounted(() => {
  if (exchangeStore.rate === 0) {
    exchangeStore.fetchExchangeRate()
  }
})

// Nombre formateado del usuario
const username = computed(() => {
  const rawName = authStore.user?.username || 'Daniel'
  return rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase()
})
</script>

<template>
  <div class="h-full flex flex-col bg-slate-100 overflow-hidden">
    <!-- Header ejecutivo con la misma estructura y saludo personalizado de las demás vistas -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs gap-3">
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          Al Cambio
        </h1>
        <p class="text-xs sm:text-sm text-emerald-600 font-semibold truncate mt-0.5">
          Calculadora rápida y monitoreo oficial de divisas, {{ username }}
        </p>
      </div>
    </header>

    <!-- Contenido principal con scroll fluido y clases personalizadas de scrollbar -->
    <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 custom-scrollbar">
      <div class="max-w-4xl mx-auto space-y-5 sm:space-y-6 pb-20">
        
        <!-- Tarjeta de Conversión Principal -->
        <ExchangeCard 
          :rate="exchangeStore.rate"
          :last-update="exchangeStore.lastUpdated"
          :is-updating="exchangeStore.loading"
          @refresh="exchangeStore.fetchExchangeRate"
        />

        <!-- Sección inferior con responsividad en Grid (Tendencia y Equivalencias Clave) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <ExchangeTrendCard 
            :rate="exchangeStore.rate"
            class="lg:col-span-2"
          />
          <ExchangePresetsCard 
            :rate="exchangeStore.rate"
          />
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