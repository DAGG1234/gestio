<!-- src/components/InstallPrompt.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const deferredPrompt = ref<any>(null)
const showInstallBanner = ref(false)

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    // Previene que el navegador muestre su banner automático por defecto
    e.preventDefault()
    // Guarda el evento para usarlo cuando el usuario haga clic
    deferredPrompt.value = e
    // Muestra nuestro banner personalizado
    showInstallBanner.value = true
  })

  window.addEventListener('appinstalled', () => {
    showInstallBanner.value = false
    deferredPrompt.value = null
    console.log('¡Gestio fue instalada con éxito!')
  })
})

const installApp = async () => {
  if (!deferredPrompt.value) return
  
  // Muestra el aviso nativo de instalación
  deferredPrompt.value.prompt()
  
  // Espera la respuesta del usuario
  const { outcome } = await deferredPrompt.value.userChoice
  if (outcome === 'accepted') {
    console.log('El usuario aceptó instalar la PWA')
  } else {
    console.log('El usuario canceló la instalación')
  }
  
  deferredPrompt.value = null
  showInstallBanner.value = false
}

const closeBanner = () => {
  showInstallBanner.value = false
}
</script>

<template>
  <transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-10 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-10 opacity-0"
  >
    <div v-if="showInstallBanner" class="fixed bottom-20 md:bottom-6 right-6 z-50 max-w-sm bg-slate-900 border border-slate-700/80 shadow-2xl rounded-2xl p-4 flex items-center gap-4 text-slate-100">
      <div class="bg-[#0b4d6c] p-3 rounded-xl flex items-center justify-center shrink-0">
        <img src="/gestio.png" alt="Gestio Logo" class="w-8 h-8 object-contain" />
      </div>
      <div class="flex-1">
        <h4 class="font-bold text-sm">Instalar Gestio</h4>
        <p class="text-xs text-slate-400">Accede más rápido y úsala sin conexión a internet.</p>
      </div>
      <div class="flex flex-col gap-1">
        <button @click="installApp" class="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
          Instalar
        </button>
        <button @click="closeBanner" class="text-slate-400 hover:text-slate-200 text-[10px] text-center">
          Ahora no
        </button>
      </div>
    </div>
  </transition>
</template>