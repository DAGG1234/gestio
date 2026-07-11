<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '../stores/userStore';
import logoImg from '../assets/logo-gestio.png';
import {
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  Cog6ToothIcon,
  ShieldCheckIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline';

const userStore = useUserStore();
const menuAbierto = ref(false);
const showPasswordForm = ref(false);
const passAnterior = ref('');
const passNueva = ref('');

const handlePasswordUpdate = () => {
  userStore.cambiarPassword(passAnterior.value, passNueva.value);
  passAnterior.value = '';
  passNueva.value = '';
  showPasswordForm.value = false;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">

    <header class="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-40">
      <button @click="menuAbierto = true" class="p-2 text-gray-600">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
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
          <RouterLink to="/configuracion" active-class="font-bold text-[#0332fd] border-l-4 border-[#0332fd]"
            class="flex items-center gap-3 font-bold text-[#0332fd] border-l-4 border-[#0332fd] pl-4 py-2">
            <Cog6ToothIcon class="w-5 h-5" /> Configuración
          </RouterLink>
        </li>
      </ul>
      <div class="mt-auto pt-6 text-xs text-gray-400 font-medium text-center">Versión 1.0</div>
    </nav>

    <div v-if="menuAbierto" @click="menuAbierto = false" class="md:hidden fixed inset-0 bg-black/50 z-40"></div>

    <main class="p-6 md:ml-64 md:p-12">
      <h2 class="text-3xl font-bold mb-8">Configuración</h2>

      <section class="bg-white p-8 rounded-3xl shadow-sm mb-6 border border-gray-100">
        <h3 class="font-bold text-lg mb-6 flex items-center gap-2 text-gray-800">
          <UserIcon class="w-6 h-6 text-[#0332fd]" /> Información de Usuario
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-gray-600 flex items-center gap-1">
              <UserIcon class="w-4 h-4 text-gray-400" /> Usuario
            </label>
            <input :value="userStore.nombre" readonly
              class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500" />
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-sm font-semibold text-gray-600 flex items-center gap-1">
              <EnvelopeIcon class="w-4 h-4 text-gray-400" /> Correo
            </label>
            <input :value="userStore.correo" readonly
              class="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500" />
          </div>
        </div>

        <button v-if="!showPasswordForm" @click="showPasswordForm = true"
          class="text-[#0332fd] font-semibold hover:underline flex items-center gap-2">
          <KeyIcon class="w-4 h-4" /> Actualizar contraseña
        </button>

        <div v-if="showPasswordForm" class="mt-6 p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <input v-model="passAnterior" type="password" placeholder="Contraseña actual"
              class="w-full p-3 rounded-xl border border-gray-200" />
            <input v-model="passNueva" type="password" placeholder="Nueva contraseña"
              class="w-full p-3 rounded-xl border border-gray-200" />
          </div>
          <div class="flex gap-4">
            <button @click="handlePasswordUpdate"
              class="bg-[#0332fd] text-white px-6 py-2 rounded-xl font-bold">Aceptar</button>
            <button @click="showPasswordForm = false" class="text-gray-500">Cancelar</button>
          </div>
        </div>
      </section>

      <button @click="userStore.cerrarSesion" class="text-red-500 font-semibold mt-4">Cerrar sesión</button>
    </main>
  </div>
</template>