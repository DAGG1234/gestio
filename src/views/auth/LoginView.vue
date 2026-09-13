<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'

// Importación del Isotipo SVG oficial de Gestio desde assets
import GestioLogo from '@/assets/gestioIco.svg'

// ==========================================
// SERVICIOS Y STORES
// ==========================================
const router = useRouter()
const authStore = useAuthStore()

// ==========================================
// ESTADO REACTIVO
// ==========================================
const identifier = ref<string>('')
const password = ref<string>('')
const errorMessage = ref<string | null>(null)
const isLoading = ref<boolean>(false)

// ==========================================
// MÉTODOS Y MANEJADORES
// ==========================================
const clearError = (): void => {
  if (errorMessage.value) {
    errorMessage.value = null
  }
}

const handleLogin = async (): Promise<void> => {
  clearError()

  if (!identifier.value.trim() || !password.value) {
    errorMessage.value = 'Por favor, completa todos los campos.'
    return
  }

  try {
    isLoading.value = true
    await authStore.login(identifier.value, password.value)
    await router.push({ name: 'dashboard' })
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage.value = error.message
    } else {
      errorMessage.value = 'Ocurrió un error inesperado al iniciar sesión.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <!-- CONTENEDOR PRINCIPAL: Estructura de pantalla completa sin desbordamientos -->
  <main class="h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800 selection:bg-[#0b4d6c] selection:text-white grid grid-cols-1 md:grid-cols-2">
    
    <!-- ========================================== -->
    <!-- PANEL IZQUIERDO: DECORATIVO / INFORMACIÓN  -->
    <!-- ========================================== -->
    <aside class="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#0b4d6c] via-[#093d56] to-[#073044] p-12 lg:p-16 text-white relative select-none overflow-hidden h-full">
      
      <!-- Círculos decorativos de fondo sutiles -->
      <div class="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>
      <div class="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-3xl pointer-events-none"></div>

      <!-- Cabecera del Panel: Marca (Sin recuadro, icono grande y tipografía corporativa) -->
      <div class="relative z-10 flex items-center gap-4">
        <div class="w-12 h-12 flex items-center justify-center">
          <img
            :src="GestioLogo"
            alt="Gestio Logo"
            class="w-full h-full object-contain [filter:brightness(0)_invert(1)]"
          />
        </div>
        <span class="text-2xl font-black tracking-widest uppercase text-white">Gestio</span>
      </div>

      <!-- Contenido Central Motivacional -->
      <div class="relative z-10 max-w-lg my-auto space-y-6">
        <h2 class="text-3xl lg:text-5xl font-extrabold tracking-tight leading-tight">
          Administra tus finanzas con precisión y elegancia.
        </h2>
        <p class="text-sm lg:text-base text-slate-300 font-medium leading-relaxed">
          Centraliza el seguimiento de tus gastos, ahorros y deudas en una sola plataforma diseñada para optimizar tu rendimiento financiero diario.
        </p>
      </div>

      <!-- Pie del Panel -->
      <div class="relative z-10 text-xs text-slate-400 font-medium">
        &copy; 2026 Gestio. Todos los derechos reservados.
      </div>
    </aside>

    <!-- ========================================== -->
    <!-- PANEL DERECHO: FORMULARIO DE ACCESO        -->
    <!-- ========================================== -->
    <section class="flex flex-col items-center justify-center p-6 sm:p-10 lg:p-16 bg-white md:bg-slate-50 h-full overflow-y-auto">
      
      <div class="w-full max-w-md my-auto space-y-8">
        
        <!-- CABECERA DEL FORMULARIO -->
        <header class="flex flex-col items-center text-center space-y-3">
          <!-- Logotipo grande en azul corporativo exacto -->
          <div class="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
            <img
              :src="GestioLogo"
              alt="Gestio Logo"
              class="w-full h-full object-contain [filter:brightness(0)_saturate(100%)_invert(23%)_sepia(38%)_saturate(2013%)_hue-rotate(172deg)_brightness(94%)_contrast(94%)]"
            />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1">
              Iniciar Sesión
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 font-medium">
              Ingresa tus credenciales para continuar
            </p>
          </div>
        </header>

        <!-- BANNER DE ERROR -->
        <div
          v-if="errorMessage"
          class="p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs sm:text-sm font-medium flex items-center gap-2.5"
          role="alert"
        >
          <svg class="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- FORMULARIO DE LOGIN -->
        <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
          
          <!-- CAMPO: USUARIO O CORREO -->
          <div class="space-y-1.5">
            <label for="identifier" class="block text-xs font-semibold text-slate-600 tracking-wide">
              Usuario o correo electrónico
            </label>
            <input
              id="identifier"
              v-model="identifier"
              type="text"
              autocomplete="username"
              placeholder="usuario@email.com"
              :disabled="isLoading"
              @input="clearError"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-[#0b4d6c] focus:ring-2 focus:ring-[#0b4d6c]/20 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>

          <!-- CAMPO: CONTRASEÑA -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label for="password" class="block text-xs font-semibold text-slate-600 tracking-wide">
                Contraseña
              </label>
              <a href="#" @click.prevent class="text-xs font-semibold text-[#0b4d6c] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              :disabled="isLoading"
              @input="clearError"
              class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm font-medium focus:outline-none focus:border-[#0b4d6c] focus:ring-2 focus:ring-[#0b4d6c]/20 focus:bg-white transition-all disabled:opacity-60"
            />
          </div>

          <!-- BOTÓN DE ACCIÓN PRINCIPAL -->
          <button
            type="submit"
            :disabled="isLoading"
            class="w-full mt-2 py-3.5 px-4 bg-[#0b4d6c] hover:bg-[#093d56] active:bg-[#073044] text-white font-medium rounded-xl text-sm shadow-md shadow-[#0b4d6c]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            <svg
              v-if="isLoading"
              class="animate-spin h-4 w-4 text-white shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isLoading ? 'Ingresando...' : 'Ingresar' }}</span>
          </button>
        </form>

        <!-- ENLACE INFERIOR -->
        <footer class="text-center pt-2">
          <p class="text-xs sm:text-sm text-slate-500 font-medium">
            ¿No tienes cuenta?
            <RouterLink
              to="/register"
              class="font-semibold text-[#0b4d6c] hover:underline ml-1"
            >
              Regístrate
            </RouterLink>
          </p>
        </footer>

      </div>

    </section>

  </main>
</template>