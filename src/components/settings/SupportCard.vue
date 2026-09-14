<!-- src/components/settings/SupportCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)
const copiedField = ref<string | null>(null)

const supportData = {
  pagoMovil: {
    bank: 'Banco de Venezuela (0102)',
    phone: '0414-1235400',
    ci: 'V-31467533'
  },
  whatsapp: '+58-4141235400'
}

const copyText = (text: string, key: string) => {
  navigator.clipboard.writeText(text)
  copiedField.value = key
  setTimeout(() => {
    copiedField.value = null
  }, 2000)
}
</script>

<template>
  <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
    
    <div>
      <div class="flex items-center gap-3 mb-2">
        <div class="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">Gestio - Soporte y Colaboración</h3>
      </div>
      <p class="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
        Apoya el crecimiento y mantenimiento constante de la plataforma impulsada por <strong>DagStudio</strong>. Si requieres asistencia técnica, tienes alguna consulta o deseas colaborar, accede aquí.
      </p>
    </div>

    <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
      <span class="text-[11px] text-slate-400 font-medium">Desarrollado con dedicación para la </span>
      <button
        @click="showModal = true"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer active:scale-95"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span>Colaboración y Soporte</span>
      </button>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div class="bg-white text-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <header class="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-5">
          <h3 class="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Gestio - Soporte y Colaboración</span>
          </h3>
          <button @click="showModal = false" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors">✕</button>
        </header>

        <div class="space-y-5">
          <!-- Texto descriptivo de colaboración -->
          <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Ayuda o colabora con <strong>DagStudio</strong> para seguir manteniendo y actualizando Gestio:
          </p>

          <!-- Datos de Pago Móvil -->
          <div class="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2">
                <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pago Móvil
              </span>
              <button 
                @click="copyText(`${supportData.pagoMovil.bank} - ${supportData.pagoMovil.phone} - ${supportData.pagoMovil.ci}`, 'pm')"
                class="text-xs font-bold uppercase transition-colors cursor-pointer px-2.5 py-1 rounded-lg"
                :class="copiedField === 'pm' ? 'text-indigo-700 bg-indigo-100' : 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50'"
              >
                {{ copiedField === 'pm' ? '✓ ¡Copiado!' : 'Copiar Datos' }}
              </button>
            </div>
            <div class="text-xs sm:text-sm text-slate-600 font-medium space-y-1.5 pt-2 border-t border-slate-200/60">
              <p>Banco: <strong class="text-slate-900">{{ supportData.pagoMovil.bank }}</strong></p>
              <p>Teléfono: <strong class="text-slate-900">{{ supportData.pagoMovil.phone }}</strong></p>
              <p>C.I: <strong class="text-slate-900">{{ supportData.pagoMovil.ci }}</strong></p>
            </div>
          </div>

          <!-- Texto de Soporte y Contacto -->
          <div class="p-4 sm:p-5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs sm:text-sm font-bold text-indigo-900 flex items-center gap-2">
                <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Soporte y Dudas
              </span>
              <button 
                @click="copyText(supportData.whatsapp, 'wa')"
                class="text-xs font-bold uppercase transition-colors cursor-pointer px-2.5 py-1 rounded-lg"
                :class="copiedField === 'wa' ? 'text-indigo-700 bg-indigo-100' : 'text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100/50'"
              >
                {{ copiedField === 'wa' ? '✓ ¡Copiado!' : 'Copiar Número' }}
              </button>
            </div>
            <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Cualquier soporte, duda, etc. Escríbenos aquí: <strong class="text-slate-900">{{ supportData.whatsapp }}</strong>
            </p>
          </div>
        </div>

        <button 
          @click="showModal = false"
          class="mt-6 w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          <span>¡Entendido, muchas gracias!</span>
        </button>
      </div>
    </div>
  </div>
</template>