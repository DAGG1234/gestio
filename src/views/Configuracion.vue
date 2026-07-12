<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import { useUiStore } from '../stores/uiStore';
import logoImg from '../assets/logo-gestio.png';
import {
  UserIcon, EnvelopeIcon, Cog6ToothIcon,
  ShieldCheckIcon, ChartBarIcon, ArrowLeftOnRectangleIcon, PencilSquareIcon
} from '@heroicons/vue/24/outline';

const userStore = useUserStore();
const uiStore = useUiStore();

const menuAbierto = ref(false);
const showNameForm = ref(false);
const nuevoNombre = ref('');

const handleNameUpdate = () => {
  if (nuevoNombre.value.trim() !== '') {
    userStore.cambiarNombre(nuevoNombre.value);
    uiStore.mostrarNotificacion("¡Nombre de usuario actualizado con éxito!");
    nuevoNombre.value = '';
    showNameForm.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">

    <!-- Mobile Header -->
    <header class="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-40">
      <button @click="menuAbierto = true" class="p-2 text-gray-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16">
          </path>
        </svg>
      </button>
      <div class="flex items-center gap-2">
        <h2 class="text-2xl font-bold text-[#0332fd]">GESTIO</h2>
        <img :src="logoImg" alt="Logo" class="w-15 h-15" />
      </div>
    </header>

    <nav
      class="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 p-6 z-50 transition-transform duration-300 md:translate-x-0 flex flex-col"
      :class="menuAbierto ? 'translate-x-0' : '-translate-x-full'">
      <div class="flex items-center gap-2 mb-10">
        <img :src="logoImg" alt="Logo" class="w-15 h-15" />
        <h2 class="text-2xl font-bold text-[#0332fd]">GESTIO</h2>
      </div>
      <ul class="space-y-4">
        <li>
          <RouterLink to="/" class="flex items-center gap-3 text-gray-400 hover:text-gray-800 transition pl-4 py-2">
            <ChartBarIcon class="w-5 h-5" /> Dashboard
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/auditoria"
            class="flex items-center gap-3 text-gray-400 hover:text-gray-800 transition pl-4 py-2">
            <ShieldCheckIcon class="w-5 h-5" /> Auditoría
          </RouterLink>
        </li>
        <li>
          <RouterLink to="/configuracion"
            class="flex items-center gap-3 font-bold text-[#0332fd] border-l-4 border-[#0332fd] pl-4 py-2">
            <Cog6ToothIcon class="w-5 h-5" /> Configuración
          </RouterLink>
        </li>
      </ul>
      <div class="mt-auto pt-6 text-xs text-gray-400 font-medium text-center">Versión 1.2.0</div>
    </nav>

    <main class="p-6 md:ml-64 md:p-12">
      <h2 class="text-3xl font-bold mb-8">Configuración</h2>

      <div v-if="uiStore.mensajeNotificacion"
        class="mb-6 p-4 bg-blue-50 text-blue-700 rounded-2xl font-bold border border-blue-100">
        {{ uiStore.mensajeNotificacion }}
      </div>

      <section class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 class="font-bold text-lg mb-6 flex items-center gap-2">
          <UserIcon class="w-6 h-6 text-[#0332fd]" /> Información de Usuario
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
              <UserIcon class="w-4 h-4" /> Usuario
            </label>
            <input :value="userStore.nombre" readonly
              class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500" />
          </div>
          <div>
            <label class="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
              <EnvelopeIcon class="w-4 h-4" /> Correo
            </label>
            <input :value="userStore.correo" readonly
              class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500" />
          </div>
        </div>

        <button v-if="!showNameForm" @click="showNameForm = true"
          class="text-[#0332fd] font-semibold hover:underline flex items-center gap-2">
          <PencilSquareIcon class="w-4 h-4" /> Cambiar nombre de usuario
        </button>

        <div v-if="showNameForm" class="mt-6 p-4 md:p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <label class="block text-sm font-bold text-gray-600 mb-2">Nuevo nombre de usuario:</label>

          <div class="flex flex-col md:flex-row gap-3 md:gap-4">

            <input v-model="nuevoNombre" type="text" placeholder="Ej: Juan Perez"
              class="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#0332fd] outline-none" />

            <div class="flex gap-3">
              <button @click="handleNameUpdate"
                class="flex-1 md:flex-none bg-[#0332fd] text-white px-6 py-3 md:py-2 rounded-xl font-bold hover:bg-blue-800 transition whitespace-nowrap">
                Aceptar
              </button>

              <button @click="showNameForm = false" class="px-4 text-gray-500 hover:text-gray-800 font-medium">
                Cancelar
              </button>
            </div>

          </div>
        </div>
      </section>

      <button @click="userStore.cerrarSesion"
        class="flex items-center gap-2 text-red-500 font-semibold mt-8 hover:text-red-700 transition">
        <ArrowLeftOnRectangleIcon class="w-5 h-5" /> Cerrar sesión
      </button>
    </main>
  </div>
</template>