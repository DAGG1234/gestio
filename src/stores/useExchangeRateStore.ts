// src/stores/useExchangeRateStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useExchangeRateStore = defineStore('exchangeRate', () => {
  const rate = ref<number>(0)
  const lastUpdated = ref<string>('')
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchExchangeRate = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial')
      if (!response.ok) throw new Error('No se pudo obtener la tasa oficial del BCV')
      const data = await response.json()
      rate.value = data.promedio || data.price || 0
      lastUpdated.value = new Date().toISOString()
    } catch (err: any) {
      error.value = err.message || 'Error desconocido'
      // Tasa referencial de respaldo en caso de fallo de red
      if (rate.value === 0) rate.value = 36.5 
    } finally {
      loading.value = false
    }
  }

  return {
    rate,
    lastUpdated,
    loading,
    error,
    fetchExchangeRate
  }
})