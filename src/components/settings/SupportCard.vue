<!-- src/components/settings/SupportCard.vue -->
<script setup lang="ts">
import { ref } from 'vue'

const showSupportModal = ref(false)
const copiedField = ref<string | null>(null)
const gestioLogo = new URL('@/assets/gestioIco.svg', import.meta.url).href

const supportData = {
  pagoMovil: {
    bank: 'Venezolano de Credito (0104)',
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

const openModal = () => {
  showSupportModal.value = true
}
</script>

<template>
  <div class="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between relative overflow-hidden">
    
    <div>
      <div class="flex items-center gap-3 mb-2">
        <div class="w-8 h-8 rounded-xl bg-[#0b4d6c]/10 text-[#0b4d6c] flex items-center justify-center shrink-0 border border-[#0b4d6c]/20">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 class="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-800">Soporte y Colaboración</h3>
      </div>
      <p class="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
        Apoya o colabora con <strong>DagStudio</strong> mediante Pago Móvil o contáctanos para mantener Gestio activo y en constante evolución.
      </p>
    </div>

    <div class="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
      <span class="text-[11px] text-slate-400 font-medium">Transparencia y comunidad</span>
      <button
        @click="openModal"
        class="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0b4d6c] hover:bg-[#093d56] text-white text-xs font-bold rounded-xl shadow-md shadow-[#0b4d6c]/20 transition-all cursor-pointer active:scale-95"
      >
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Apoyar proyecto</span>
      </button>
    </div>

    <!-- MODAL DE SOPORTE / PAGO MÓVIL RESPONSIVO -->
    <div v-if="showSupportModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <header class="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 sm:mb-5">
          <h3 class="text-xs sm:text-base font-black text-slate-900 flex items-center gap-2.5 sm:gap-3.5 truncate">
            <img 
              :src="gestioLogo" 
              alt="Gestio Logo" 
              class="w-8 h-8 sm:w-11 sm:h-11 object-contain shrink-0 gestio-logo-color" 
            />
            <span class="truncate">Gestio - Soporte y Colaboración</span>
          </h3>
          <button @click="showSupportModal = false" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">✕</button>
        </header>

        <div class="space-y-4 sm:space-y-5">
          <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Ayuda o colabora con <strong>DagStudio</strong> para seguir manteniendo y actualizando Gestio:
          </p>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 shrink-0">
                <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pago Móvil
              </span>
              <button 
                @click="copyText(`${supportData.pagoMovil.bank} - ${supportData.pagoMovil.phone} - ${supportData.pagoMovil.ci}`, 'pm')"
                class="text-[11px] sm:text-xs font-bold uppercase transition-colors cursor-pointer px-2.5 py-1 rounded-lg shrink-0"
                :class="copiedField === 'pm' ? 'text-[#0b4d6c] bg-[#0b4d6c]/15' : 'text-[#0b4d6c] hover:bg-[#0b4d6c]/10'"
              >
                {{ copiedField === 'pm' ? '✓ ¡Copiado!' : 'Copiar Datos' }}
              </button>
            </div>
            <div class="text-xs sm:text-sm text-slate-600 font-medium space-y-1.5 pt-2 border-t border-slate-200/60 overflow-x-auto">
              <p>Banco: <strong class="text-slate-900">{{ supportData.pagoMovil.bank }}</strong></p>
              <p>Teléfono: <strong class="text-slate-900">{{ supportData.pagoMovil.phone }}</strong></p>
              <p>C.I: <strong class="text-slate-900">{{ supportData.pagoMovil.ci }}</strong></p>
            </div>
          </div>

          <div class="p-4 bg-[#0b4d6c]/5 rounded-2xl border border-[#0b4d6c]/15 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs sm:text-sm font-bold text-[#0b4d6c] flex items-center gap-2 shrink-0">
                <svg class="w-4 h-4 text-[#0b4d6c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Soporte y Dudas
              </span>
              <button 
                @click="copyText(supportData.whatsapp, 'wa')"
                class="text-[11px] sm:text-xs font-bold uppercase transition-colors cursor-pointer px-2.5 py-1 rounded-lg shrink-0"
                :class="copiedField === 'wa' ? 'text-[#0b4d6c] bg-[#0b4d6c]/15' : 'text-[#0b4d6c] hover:bg-[#0b4d6c]/10'"
              >
                {{ copiedField === 'wa' ? '✓ ¡Copiado!' : 'Copiar Número' }}
              </button>
            </div>
            <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed break-words">
              Cualquier soporte, duda, etc. Escríbenos aquí: <strong class="text-slate-900">{{ supportData.whatsapp }}</strong>
            </p>
          </div>
        </div>

        <button 
          @click="showSupportModal = false"
          class="mt-5 sm:mt-6 w-full py-3 sm:py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          <span>¡Entendido, muchas gracias!</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.gestio-logo-color {
  filter: brightness(0) saturate(100%) invert(20%) sepia(85%) saturate(1450%) hue-rotate(175deg) brightness(92%) contrast(98%);
}
</style>