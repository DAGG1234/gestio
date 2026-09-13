// src/stores/useCurrencyToggle.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useExchangeRateStore } from './useExchangeRateStore'

export const useCurrencyToggle = defineStore('currencyToggle', () => {
  const currentCurrency = ref<'VES' | 'USD'>('VES')
  const exchangeRateStore = useExchangeRateStore()

  const toggleCurrency = () => {
    currentCurrency.value = currentCurrency.value === 'VES' ? 'USD' : 'VES'
  }

  // Tasa de cambio actual (por defecto 1 si no está disponible)
  const rate = computed(() => exchangeRateStore.rate || 1)

  /**
   * Formatea cualquier monto en Bolívares base hacia la moneda seleccionada (VES o USD)
   */
  const formatMoney = (amountInVES: number) => {
    if (currentCurrency.value === 'USD') {
      const amountInUSD = rate.value > 0 ? amountInVES / rate.value : 0
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amountInUSD)
    } else {
      // Formateo numérico puro en español sin usar style: 'currency' para evitar que el navegador inyecte "Bs.S"
      const formattedNumber = new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amountInVES)

      return `${formattedNumber} Bs.`
    }
  }

  return {
    currentCurrency,
    toggleCurrency,
    formatMoney
  }
})