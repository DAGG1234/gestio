// src/stores/usePetStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase'

export type PetMood = 'happy' | 'neutral' | 'sad'

export const usePetStore = defineStore('pet', () => {
  const petName = ref<string>('Kiki')
  const petMood = ref<PetMood>('neutral')
  const affectionCount = ref<number>(0)
  const isLoading = ref<boolean>(false)

  // Obtener el ID del usuario autenticado actual
  const getUserId = async (): Promise<string> => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      throw new Error('No hay una sesión activa en Supabase.')
    }
    return session.user.id
  }

  // Cargar los datos de la mascota desde Supabase
  const fetchPetData = async () => {
    isLoading.value = true
    try {
      const userId = await getUserId()
      const { data, error } = await supabase
        .from('user_pets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (error) throw error

      if (data) {
        petName.value = data.pet_name || 'Kiki'
        affectionCount.value = Number(data.affection_count) || 0
      } else {
        // Si no existe un registro previo para este usuario, crear uno por defecto
        await supabase.from('user_pets').insert([
          { user_id: userId, pet_name: 'Kiki', affection_count: 0 }
        ])
      }
    } catch (error) {
      console.error('Error al cargar los datos de la mascota desde Supabase:', error)
    } finally {
      isLoading.value = false
    }
  }

  // Acciones para modificar el estado y persistir en Supabase de forma asíncrona
  const setPetName = async (name: string) => {
    const trimmedName = name.trim()
    if (!trimmedName) return

    petName.value = trimmedName
    try {
      const userId = await getUserId()
      await supabase
        .from('user_pets')
        .upsert({ user_id: userId, pet_name: trimmedName, affection_count: affectionCount.value }, { onConflict: 'user_id' })
    } catch (error) {
      console.error('Error al actualizar el nombre de la mascota en Supabase:', error)
    }
  }

  const addAffection = async (amount = 1) => {
    affectionCount.value += amount
    try {
      const userId = await getUserId()
      await supabase
        .from('user_pets')
        .upsert({ user_id: userId, pet_name: petName.value, affection_count: affectionCount.value }, { onConflict: 'user_id' })
    } catch (error) {
      console.error('Error al actualizar la afectación de la mascota en Supabase:', error)
    }
  }

  const updateMoodByHealth = (healthPercentage: number) => {
    if (healthPercentage >= 70) {
      petMood.value = 'happy'
    } else if (healthPercentage >= 40) {
      petMood.value = 'neutral'
    } else {
      petMood.value = 'sad'
    }
  }

  return {
    petName,
    petMood,
    affectionCount,
    isLoading,
    fetchPetData,
    setPetName,
    addAffection,
    updateMoodByHealth
  }
})