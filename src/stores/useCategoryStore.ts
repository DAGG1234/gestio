// src/stores/useCategoryStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCategoryStore = defineStore('category', () => {
  const incomeCategories = ref<string[]>([
    'Sueldo',
    'Emprendimiento',
    'Regalo',
    'Inversiones',
    'Otros'
  ])

  const expenseCategories = ref<string[]>([
    'Hogar',
    'Salud',
    'Alimentación',
    'Transporte',
    'Ocio',
    'Servicios',
    'Otras'
  ])

  return {
    incomeCategories,
    expenseCategories
  }
})