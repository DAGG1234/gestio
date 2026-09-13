<!-- src/views/ExchangeView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useExchangeRateStore } from '@/stores/useExchangeRateStore'
import ExchangeCard from '@/components/exchange/ExchangeCard.vue'
import ExchangeTrendCard from '@/components/exchange/ExchangeTrendCard.vue'
import ExchangePresetsCard from '@/components/exchange/ExchangePresetsCard.vue'

const exchangeStore = useExchangeRateStore()

onMounted(() => {
  if (exchangeStore.rate === 0) {
    exchangeStore.fetchExchangeRate()
  }
})
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50/50 overflow-hidden">
    <!-- Header ejecutivo minimalista idéntico al Dashboard -->
    <header class="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 flex items-center justify-between shrink-0 shadow-2xs gap-3">
      <div class="min-w-0">
        <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
          Al Cambio
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 font-medium truncate mt-0.5">
          Calculadora rápida y monitoreo oficial de divisas
        </p>
      </div>
    </header>

    <!-- Contenido principal con scroll fluido -->
    <div class="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
      <div class="max-w-4xl mx-auto space-y-6 pb-20">
        
        <!-- Tarjeta de Conversión Principal -->
        <ExchangeCard 
          :rate="exchangeStore.rate"
          :last-update="exchangeStore.lastUpdated"
          :is-updating="exchangeStore.loading"
          @refresh="exchangeStore.fetchExchangeRate"
        />

        <!-- Sección inferior con responsividad en Grid (Tendencia y Equivalencias Clave) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
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