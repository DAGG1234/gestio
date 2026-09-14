<!-- src/components/settings/ReviewsCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '@/supabase'

const showModal = ref(false)
const reviews = ref<any[]>([])
const loading = ref(false)
const averageRating = ref(0)
const totalReviews = ref(0)

const fetchReviews = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('user_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data && data.length > 0) {
      reviews.value = data
      totalReviews.value = data.length
      const sum = data.reduce((acc, curr) => acc + Number(curr.rating), 0)
      averageRating.value = Number((sum / data.length).toFixed(1))
    } else {
      reviews.value = []
      totalReviews.value = 0
      averageRating.value = 0
    }
  } catch (err) {
    console.error('Error al cargar las reseñas:', err)
  } finally {
    loading.value = false
  }
}

const openModal = () => {
  showModal.value = true
  fetchReviews()
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })
}
</script>

<template>
  <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
    
    <div>
      <div class="flex items-center gap-3 mb-2">
        <div class="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">Reseñas y Experencias</h3>
      </div>
      <p class="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
        Consulta las opiniones y calificaciones compartidas por los usuarios sobre el rendimiento, utilidad y constante evolución de Gestio.
      </p>
    </div>

    <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
      <span class="text-[11px] text-slate-400 font-medium">Transparencia y comunidad</span>
      <button
        @click="openModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all cursor-pointer active:scale-95"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>Ver Reseñas</span>
      </button>
    </div>

    <!-- MODAL DE RESEÑAS -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 max-w-xl w-full shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200 max-h-[85vh]">
        
        <!-- Header del Modal -->
        <header class="flex items-center justify-between border-b border-slate-100 pb-4 mb-5 shrink-0">
          <div>
            <h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
              <span class="text-teal-600 text-2xl">★</span>
              <span>Opiniones de la Comunidad</span>
            </h3>
            
            <!-- Promedio con estrellas visuales extra grandes en color teal -->
            <div class="flex items-center gap-3 mt-2">
              <span class="text-xs text-slate-400">Total: <strong class="text-slate-700">{{ totalReviews }}</strong></span>
              <span class="text-slate-300">•</span>
              <div class="flex items-center gap-1.5 text-teal-600 text-xl">
                <span v-for="s in 5" :key="s">
                  {{ s <= averageRating ? '★' : s - 0.5 === averageRating ? '★' : '☆' }}
                </span>
                <strong class="ml-2 text-slate-900 text-sm font-black">({{ averageRating }}/5)</strong>
              </div>
            </div>
          </div>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors">✕</button>
        </header>

        <!-- Lista de Reseñas (Con Scroll) -->
        <div class="overflow-y-auto space-y-3.5 pr-1 custom-scrollbar grow">
          <div v-if="loading" class="py-12 text-center text-xs text-slate-400 font-medium">
            Cargando reseñas...
          </div>
          
          <div v-else-if="reviews.length === 0" class="py-12 text-center text-xs text-slate-400 font-medium">
            Aún no hay reseñas registradas. ¡Sé el primero en calificar la app!
          </div>

          <div 
            v-for="rev in reviews" 
            :key="rev.id" 
            class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 hover:border-slate-300 transition-colors"
          >
            <!-- Info real del usuario -->
            <div class="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                  {{ (rev.username || 'U').charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-800">{{ rev.username || 'Usuario' }}</h4>
                  <p class="text-[10px] text-slate-400">{{ rev.email || 'correo@ejemplo.com' }}</p>
                </div>
              </div>
              <span class="text-[10px] font-semibold text-slate-400">{{ formatDate(rev.created_at) }}</span>
            </div>

            <!-- Estrellas individuales en color teal y Comentario -->
            <div class="flex items-center justify-between pt-1">
              <div class="flex items-center gap-1 text-teal-600 text-sm">
                <span v-for="s in 5" :key="s">
                  {{ s <= rev.rating ? '★' : s - 0.5 === rev.rating ? '★' : '☆' }}
                </span>
                <span class="ml-2 text-xs font-bold text-slate-700">({{ rev.rating }}/5)</span>
              </div>
            </div>

            <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">
              "{{ rev.comment }}"
            </p>
          </div>
        </div>

        <!-- Botón Cerrar -->
        <button 
          @click="showModal = false"
          class="mt-5 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 shrink-0"
        >
          <span>Cerrar</span>
        </button>
      </div>
    </div>
  </div>
</template>