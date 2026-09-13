<!-- src/components/settings/DangerZone.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFinanceStore } from '@/stores/useFinanceStore'
import { useAuthStore } from '@/stores/useAuthStore'

const router = useRouter()
const financeStore = useFinanceStore()
const authStore = useAuthStore()

const showResetModal = ref(false)
const showDeleteModal = ref(false)
const confirmDeleteText = ref('')

const isResetting = ref(false)
const isDeleting = ref(false)

const handleResetAccount = async () => {
  if (isResetting.value) return
  try {
    isResetting.value = true
    await financeStore.resetAllData()
    showResetModal.value = false
  } catch (error) {
    console.error('Error al reiniciar la cuenta:', error)
  } finally {
    isResetting.value = false
  }
}

const handleDeleteAccount = async () => {
  if (confirmDeleteText.value !== 'ELIMINAR' || isDeleting.value) return

  try {
    isDeleting.value = true
    
    // Elimina todos los datos financieros del usuario en Supabase
    await financeStore.resetAllData()
    
    // Limpia almacenamiento local y cierra sesión
    localStorage.removeItem('gestio_user')
    localStorage.removeItem('gestio_current_user')
    
    if (typeof authStore.logout === 'function') {
      await authStore.logout()
    }

    showDeleteModal.value = false
    router.push('/login')
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error)
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-2xl border border-rose-200/80 p-6 shadow-sm">
    <div class="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
      <div class="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <h2 class="text-sm font-bold text-slate-800 uppercase tracking-wide">Zona de Peligro</h2>
        <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones críticas e irreversibles sobre tus datos</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Reiniciar Cuenta -->
      <div class="flex items-center justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-200/60">
        <div>
          <span class="block text-xs font-bold text-slate-800 uppercase tracking-wider">Reiniciar Cuenta</span>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Limpia transacciones y datos</span>
        </div>
        <button
          @click="showResetModal = true"
          type="button"
          class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          Reiniciar
        </button>
      </div>

      <!-- Eliminar Cuenta -->
      <div class="flex items-center justify-between p-4 rounded-xl bg-rose-50/50 border border-rose-200/60">
        <div>
          <span class="block text-xs font-bold text-slate-800 uppercase tracking-wider">Eliminar Cuenta</span>
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Acción destructiva permanente</span>
        </div>
        <button
          @click="showDeleteModal = true"
          type="button"
          class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer"
        >
          Eliminar
        </button>
      </div>
    </div>

    <!-- Modal: Reiniciar Cuenta -->
    <div v-if="showResetModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-800 uppercase tracking-wide">¿Reiniciar cuenta financiera?</h3>
        </div>
        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Esta acción borrará todas tus transacciones, metas de ahorro y deudas de Supabase, dejando tu cuenta como nueva. No se puede deshacer.
        </p>
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="showResetModal = false"
            type="button"
            :disabled="isResetting"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            @click="handleResetAccount"
            type="button"
            :disabled="isResetting"
            class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            <svg v-if="isResetting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isResetting ? 'Reiniciando...' : 'Sí, reiniciar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Doble Confirmación: Eliminar Cuenta -->
    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-rose-200 space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-xl bg-rose-500/10 text-rose-600">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-800 uppercase tracking-wide">¿Eliminar cuenta permanentemente?</h3>
        </div>
        <p class="text-xs font-semibold text-slate-600 uppercase tracking-wider">
          Se borrarán todos tus datos asociados en Supabase y tu sesión será cerrada. Escribe la palabra <strong class="text-rose-600 font-bold">ELIMINAR</strong> para confirmar:
        </p>
        <input
          v-model="confirmDeleteText"
          type="text"
          placeholder="Escribe ELIMINAR"
          :disabled="isDeleting"
          class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 uppercase tracking-wider transition-all font-medium disabled:opacity-50"
        />
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="showDeleteModal = false; confirmDeleteText = ''"
            type="button"
            :disabled="isDeleting"
            class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            @click="handleDeleteAccount"
            type="button"
            :disabled="confirmDeleteText !== 'ELIMINAR' || isDeleting"
            class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
          >
            <svg v-if="isDeleting" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ isDeleting ? 'Eliminando...' : 'Eliminar cuenta' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>