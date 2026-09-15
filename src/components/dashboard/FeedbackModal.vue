<!-- src/components/dashboard/FeedbackModal.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue' // <-- Añadimos 'computed'
import { supabase } from '@/supabase'
import { useAuthStore } from '@/stores/useAuthStore'
import GestioLogo from '@/assets/gestioIco.svg'

const emit = defineEmits(['submitted'])
const authStore = useAuthStore()

const rating = ref<number>(4.5)
const hoverRating = ref<number>(0)
const comment = ref<string>('')
const loading = ref<boolean>(false)
const errorMessage = ref<string>('')

// Validación computada para asegurar que haya estrellas y comentario válido
const isFormValid = computed(() => {
  return rating.value > 0 && comment.value.trim().length > 0
})

const calculateRatingFromMouseEvent = (event: MouseEvent, starIndex: number) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  return clickX < rect.width / 2 ? starIndex - 0.5 : starIndex
}

const handleMouseMove = (event: MouseEvent, starIndex: number) => {
  hoverRating.value = calculateRatingFromMouseEvent(event, starIndex)
}

const handleClick = (event: MouseEvent, starIndex: number) => {
  rating.value = calculateRatingFromMouseEvent(event, starIndex)
}

const submitFeedback = async () => {
  // Doble validación de seguridad por si intentan saltarse el botón
  if (!isFormValid.value) {
    errorMessage.value = 'Por favor, selecciona una calificación y escribe un comentario.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuario no autenticado')

    const currentUsername = authStore.user?.username || 'Usuario'
    const currentEmail = user.email || 'correo@sin.com'

    const { error } = await supabase.from('user_feedback').insert([
      {
        user_id: user.id,
        username: currentUsername,
        email: currentEmail,
        rating: rating.value,
        comment: comment.value.trim()
      }
    ])

    if (error) throw error

    emit('submitted')
  } catch (err: any) {
    console.error('Error al enviar feedback:', err)
    errorMessage.value = 'Hubo un error al enviar tu comentario. Inténtalo de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-fade-in">
    <div class="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-8 space-y-6">
      
      <div class="flex items-center gap-3.5 border-b border-slate-100 pb-4">
        <div class="w-12 h-12 flex items-center justify-center shrink-0">
          <img 
            :src="GestioLogo" 
            alt="Gestio Logo" 
            class="w-full h-full object-contain [filter:brightness(0)_saturate(100%)_invert(17%)_sepia(85%)_saturate(800%)_hue-rotate(170deg)]" 
          />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-900">Dinos tu experiencia</h3>
          <p class="text-[11px] text-slate-400">Ayúdanos a mejorar Gestio con tu opinión</p>
        </div>
      </div>

      <div class="space-y-1.5">
        <span class="text-xs font-medium text-slate-400">
          Calificación {{ hoverRating || rating ? `(${hoverRating || rating}/5)` : '' }}
        </span>
        <div class="flex items-center gap-1.5">
          <div
            v-for="star in 5"
            :key="star"
            @click="(e) => handleClick(e, star)"
            @mousemove="(e) => handleMouseMove(e, star)"
            @mouseleave="hoverRating = 0"
            class="text-3xl transition-transform hover:scale-110 focus:outline-none cursor-pointer relative p-1"
          >
            <span class="text-slate-200 select-none">★</span>
            <div 
              class="absolute inset-1 overflow-hidden pointer-events-none text-teal-400 select-none"
              :style="{ width: (hoverRating || rating) >= star ? '100%' : (hoverRating || rating) >= star - 0.5 ? '50%' : '0%' }"
            >
              ★
            </div>
          </div>
        </div>
      </div>

      <div class="space-y-1.5">
        <label class="text-xs font-medium text-slate-400 block">Tu opinión o comentario</label>
        <textarea
          v-model="comment"
          rows="4"
          placeholder="Cuéntanos qué te parece la plataforma..."
          class="w-full bg-white text-slate-800 text-xs p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0b4d6c]/20 focus:border-[#0b4d6c] resize-none shadow-2xs"
        ></textarea>
        <p v-if="errorMessage" class="text-[11px] text-rose-600 font-bold">{{ errorMessage }}</p>
      </div>

      <div class="flex items-center justify-end pt-2">
        <button
          @click="submitFeedback"
          :disabled="loading || !isFormValid"
          :class="[
            'w-full text-xs font-semibold px-6 py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2',
            !isFormValid || loading 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-[#0b4d6c] hover:bg-[#093d56] text-white cursor-pointer'
          ]"
        >
          <span v-if="loading">Enviando opinión...</span>
          <span v-else>Publicar reseña</span>
        </button>
      </div>

    </div>
  </div>
</template>