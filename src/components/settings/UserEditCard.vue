<!-- src/components/settings/UserEditCard.vue -->
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()
const isOpen = ref(false)

const form = reactive({
  username: '',
  email: '',
  password: ''
})

const feedbackMessage = ref('')
const errorMessage = ref('')
const isLoading = ref(false)

onMounted(() => {
  if (authStore.user) {
    form.username = authStore.user.username || ''
    form.email = authStore.user.email || ''
  }
})

const toggleEdit = () => {
  isOpen.value = !isOpen.value
  feedbackMessage.value = ''
  errorMessage.value = ''
}

const handleUpdate = async () => {
  if (isLoading.value) return

  feedbackMessage.value = ''
  errorMessage.value = ''
  isLoading.value = true

  try {
    await authStore.updateUser({
      username: form.username,
      email: form.email,
      password: form.password ? form.password : undefined
    })

    form.password = ''
    feedbackMessage.value = '¡Datos actualizados correctamente en Supabase!'
    
    setTimeout(() => {
      feedbackMessage.value = ''
      isOpen.value = false
    }, 2000)
  } catch (err: any) {
    errorMessage.value = err.message || 'Ocurrió un error al actualizar los datos con Supabase.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm transition-all">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">Actualizar Información</h2>
          <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modifica tu información personal de acceso</p>
        </div>
      </div>
      <button
        @click="toggleEdit"
        type="button"
        class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        {{ isOpen ? 'Ocultar Formulario' : 'Cambiar información' }}
      </button>
    </div>

    <!-- Formulario Desplegable e Interactivo -->
    <div v-if="isOpen" class="pt-6 transition-all animate-fadeIn">
      <form @submit.prevent="handleUpdate" class="space-y-4">
        <div v-if="feedbackMessage" class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider text-center">
          {{ feedbackMessage }}
        </div>

        <div v-if="errorMessage" class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider text-center">
          {{ errorMessage }}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre de usuario</label>
            <input
              v-model="form.username"
              type="text"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              placeholder="Tu usuario"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Correo electrónico</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              placeholder="correo@ejemplo.com"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nueva contraseña (Opcional)</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
            placeholder="Dejar en blanco para mantener la actual"
          />
        </div>

        <div class="flex justify-end pt-3">
          <button
            type="submit"
            :disabled="isLoading"
            class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            <svg v-if="isLoading" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ isLoading ? 'Guardando...' : 'Guardar cambios' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>