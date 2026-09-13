<!-- src/components/pet/RiveDogPet.vue -->
<script setup lang="ts">
import { ref } from 'vue'
import type { PetMood, PetReaction } from '@/types/pet'

interface Props {
  mood: PetMood
  petName: string
  affectionCount: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'pet'): void
}>()

const activeReaction = ref<PetReaction | null>(null)
const isPetted = ref(false)

const reactions: PetReaction[] = [
  { text: '¡Guau! *Mueve la colita feliz*', sub: '¡Gracias por el amor! 🐾💕' },
  { text: '*Da vueltitas en su camita*', sub: '¡Te quiero mucho! Juntos cuidaremos tus finanzas.' },
  { text: '*Te da la patita suavemente*', sub: '¡A comerse el mundo (y a ahorrar)! 🦴✨' },
  { text: '*Suelta un ladrido alegre*', sub: '¡Eres mi humano favorito! Sintonía perfecta.' }
]

const handlePetInteraction = () => {
  isPetted.value = true
  setTimeout(() => {
    isPetted.value = false
  }, 600)

  const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]
  activeReaction.value = randomReaction

  setTimeout(() => {
    if (activeReaction.value === randomReaction) {
      activeReaction.value = null
    }
  }, 3500)

  emit('pet')
}
</script>

<template>
  <div class="relative flex flex-col items-center justify-center select-none w-full py-2 px-4 scale-90 sm:scale-95 origin-center">
    
    <!-- Contenedor central con escala adaptada -->
    <div class="relative flex flex-col items-center justify-center my-1 w-full max-w-xs sm:max-w-none pt-12">

      <!-- Burbuja de diálogo flotante -->
      <Transition name="fade-slide">
        <div 
          v-if="activeReaction" 
          class="absolute -top-2 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-md text-white px-3.5 py-2 rounded-2xl shadow-2xl border border-indigo-500/30 text-center w-[260px] sm:w-auto sm:whitespace-nowrap pointer-events-none"
        >
          <p class="text-[11px] font-black text-pink-300">{{ activeReaction.text }}</p>
          <p class="text-[9px] text-slate-300 mt-0.5">{{ activeReaction.sub }}</p>
          <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-b border-r border-indigo-500/30"></div>
        </div>
      </Transition>

      <!-- Nombre limpio arriba -->
      <div class="mb-1">
        <span class="text-xs sm:text-sm font-black tracking-widest uppercase text-slate-800 drop-shadow-sm">
          {{ petName || 'Kiki' }}
        </span>
      </div>

      <!-- Perrito suelto, animado y con tamaño optimizado -->
      <div 
        @click="handlePetInteraction"
        class="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95 group"
      >
        <!-- Sombra flotante -->
        <div class="absolute bottom-1.5 w-24 sm:w-28 h-4 sm:h-5 bg-black/15 rounded-full blur-[5px]"></div>

        <div 
          class="relative w-full h-full flex items-center justify-center transition-transform duration-300"
          :class="{ 'scale-110 rotate-2': isPetted }"
        >
          <!-- Colita -->
          <div class="absolute bottom-8 sm:bottom-10 -right-0.5 w-5 sm:w-6 h-11 sm:h-13 bg-gradient-to-t from-[#8D5524] to-[#C68B59] rounded-full rotate-[40deg] origin-bottom shadow-md"
            :class="mood === 'sad' ? 'animate-tail-sad' : 'animate-tail-wag'"
          ></div>

          <!-- Cuerpo -->
          <div class="absolute bottom-1.5 w-24 sm:w-28 h-20 sm:h-24 bg-gradient-to-b from-[#C68B59] to-[#8D5524] rounded-[2rem] shadow-xl flex items-center justify-center transition-all duration-500"
            :class="mood === 'sad' ? 'scale-95 brightness-90' : 'animate-breathe'"
          >
            <div class="absolute top-2.5 w-12 sm:w-14 h-13 sm:h-16 bg-gradient-to-b from-[#FFF5EE] to-[#EFE3D8] rounded-full shadow-inner opacity-95"></div>
          </div>

          <!-- Patitas delanteras -->
          <div class="absolute bottom-0 left-6 sm:left-8 w-5 sm:w-6 h-6 sm:h-8 bg-gradient-to-b from-[#A06535] to-[#79461B] rounded-t-xl shadow-md"></div>
          <div class="absolute bottom-0 right-6 sm:right-8 w-5 sm:w-6 h-6 sm:h-8 bg-gradient-to-b from-[#A06535] to-[#79461B] rounded-t-xl shadow-md"></div>

          <!-- Cabezota -->
          <div class="absolute top-1 w-28 sm:w-34 h-22 sm:h-26 bg-gradient-to-br from-[#D49A6A] via-[#C68B59] to-[#995C2B] rounded-[1.8rem] shadow-2xl flex flex-col items-center justify-center border-t border-amber-300/45 transition-all duration-500"
            :class="mood === 'sad' ? 'translate-y-1.5 brightness-90 saturate-75' : 'animate-head-bob'"
          >
            <!-- Orejas -->
            <div class="absolute -top-2.5 -left-4 sm:-left-5 w-10 sm:w-11 h-14 sm:h-17 bg-gradient-to-b from-[#A06535] to-[#6E3C12] rounded-full origin-top shadow-md transition-all duration-500"
              :class="mood === 'sad' ? 'rotate-[-38deg] translate-y-1.5' : 'rotate-[-20deg] animate-ear-left'"
            ></div>
            <div class="absolute -top-2.5 -right-4 sm:-right-5 w-10 sm:w-11 h-14 sm:h-17 bg-gradient-to-b from-[#A06535] to-[#6E3C12] rounded-full origin-top shadow-md transition-all duration-500"
              :class="mood === 'sad' ? 'rotate-[38deg] translate-y-1.5' : 'rotate-[20deg] animate-ear-right'"
            ></div>

            <div class="absolute top-3 sm:top-4 left-3.5 sm:left-4 w-11 sm:w-13 h-12 sm:h-14 bg-[#8D5524] rounded-full rotate-[-12deg] opacity-75 blur-[0.5px]"></div>

            <!-- Ojos -->
            <div class="flex items-center gap-5 sm:gap-6 mt-1.5 z-10">
              <div class="w-3.5 sm:w-4 h-4 sm:h-5 bg-slate-900 rounded-full relative overflow-hidden shadow-inner transition-transform duration-300"
                :class="mood === 'sad' ? 'scale-y-75 rotate-6' : 'animate-blink'"
              >
                <div class="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
              </div>
              <div class="w-3.5 sm:w-4 h-4 sm:h-5 bg-slate-900 rounded-full relative overflow-hidden shadow-inner transition-transform duration-300"
                :class="mood === 'sad' ? 'scale-y-75 -rotate-6' : 'animate-blink'"
              >
                <div class="absolute top-0.5 right-0.5 w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>

            <!-- Hocico y boca -->
            <div class="mt-0.5 sm:mt-1 flex flex-col items-center z-10">
              <div class="w-12 sm:w-14 h-7 sm:h-9 bg-gradient-to-b from-[#FFF5EE] to-[#E3D4C6] rounded-xl shadow-inner flex flex-col items-center justify-start pt-0.5 border border-amber-100/50">
                <div class="w-4 sm:w-5 h-3 sm:h-3.5 bg-gradient-to-tr from-slate-900 to-slate-800 rounded-full relative shadow-md">
                  <div class="absolute top-0.5 left-0.5 w-0.5 h-0.5 bg-white/60 rounded-full"></div>
                </div>
                <!-- Boca adaptativa según tristeza o felicidad -->
                <div v-if="mood !== 'sad'" class="w-4 sm:w-5 h-2 border-b-2 border-slate-800 rounded-full -mt-0.5"></div>
                <div v-else class="w-4 sm:w-5 h-2 border-t-2 border-slate-800 rounded-full mt-0.5"></div>
              </div>
            </div>

            <!-- Mejillas -->
            <div v-if="mood !== 'sad'" class="absolute top-9 sm:top-10 left-2.5 sm:left-3 w-4 h-2.5 bg-pink-500 rounded-full blur-[2px] opacity-60"></div>
            <div v-if="mood !== 'sad'" class="absolute top-9 sm:top-10 right-2.5 sm:right-3 w-4 h-2.5 bg-pink-500 rounded-full blur-[2px] opacity-60"></div>
          </div>

        </div>
      </div>

    </div>

    <!-- Botón de caricias ajustado -->
    <button
      type="button"
      @click.stop="handlePetInteraction"
      class="mt-2 sm:mt-3 px-4 sm:px-5 py-1.5 sm:py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 group z-20"
    >
      <span class="group-hover:scale-125 transition-transform">💕</span>
      <span>Dar caricia :3</span>
      <span class="ml-1 text-[11px] bg-pink-700/60 px-2 py-0.5 rounded-lg font-mono">({{ affectionCount }})</span>
    </button>

  </div>
</template>

<style scoped>
@keyframes breathe {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(1.04); }
}

@keyframes headBob {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-2px) rotate(1deg); }
}

@keyframes tailWag {
  0%, 100% { transform: rotate(30deg) scale(1); }
  50% { transform: rotate(60deg) scale(1.05); }
}

@keyframes tailSad {
  0%, 100% { transform: rotate(15deg) scale(0.9); }
  50% { transform: rotate(25deg) scale(0.9); }
}

@keyframes earLeft {
  0%, 100% { transform: rotate(-20deg); }
  50% { transform: rotate(-28deg); }
}

@keyframes earRight {
  0%, 100% { transform: rotate(20deg); }
  50% { transform: rotate(28deg); }
}

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

.animate-breathe {
  animation: breathe 4s ease-in-out infinite;
}

.animate-head-bob {
  animation: headBob 2.5s ease-in-out infinite;
}

.animate-tail-wag {
  animation: tailWag 0.35s ease-in-out infinite alternate;
}

.animate-tail-sad {
  animation: tailSad 1.5s ease-in-out infinite alternate;
}

.animate-ear-left {
  animation: earLeft 3s ease-in-out infinite;
}

.animate-ear-right {
  animation: earRight 3s ease-in-out infinite;
}

.animate-blink {
  animation: blink 4s infinite;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translate(-50%, -10px) scale(0.95);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px) scale(0.95);
}
</style>