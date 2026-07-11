<script setup lang="ts">
import { ref } from 'vue';
import { useGestioStore } from '../stores/gestioStore';
import logoImg from '../assets/logo-gestio.png';
import GraficaGastos from '../components/GraficaGastos.vue';
import {
    ChartBarIcon,
    ShieldCheckIcon,
    Cog6ToothIcon,
    WalletIcon,
    PlusCircleIcon,
    MinusCircleIcon,
    TrashIcon
} from '@heroicons/vue/24/outline';

const store = useGestioStore();
const menuAbierto = ref(false);
const tipoSeleccionado = ref<'Ingreso' | 'Egreso' | null>(null);
const montoInput = ref(0);
const descInput = ref('');
const categoriaInput = ref('Hogar');
const categorias = ['Hogar', 'Comida', 'Salida', 'Ropa', 'Transporte', 'Salud', 'Educación'];

const ejecutarAccion = () => {
    if (montoInput.value <= 0) return;
    const cat = tipoSeleccionado.value === 'Ingreso' ? 'Ingreso' : categoriaInput.value;
    const desc = tipoSeleccionado.value === 'Ingreso' ? 'Ingreso' : descInput.value;
    store.agregarMovimiento(tipoSeleccionado.value!, cat, desc, montoInput.value);

    tipoSeleccionado.value = null;
    montoInput.value = 0;
    descInput.value = '';
};
</script>

<template>
    <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">

        <header
            class="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-40">
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

        <nav class="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 p-6 z-50 transition-transform duration-300 md:translate-x-0 flex flex-col"
            :class="menuAbierto ? 'translate-x-0' : '-translate-x-full'">
            <div class="flex items-center gap-2 mb-10">
                <img :src="logoImg" alt="Logo" class="w-15 h-15" />
                <h2 class="text-2xl font-bold text-[#0332fd]">GESTIO</h2>
            </div>
            <ul class="space-y-4">
                <li>
                    <RouterLink to="/" active-class="font-bold text-[#0332fd] border-l-4 border-[#0332fd]"
                        class="flex items-center gap-3 font-bold text-[#0332fd] border-l-4 border-[#0332fd] pl-4 py-2">
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
                        class="flex items-center gap-3 text-gray-400 hover:text-gray-800 transition pl-4 py-2">
                        <Cog6ToothIcon class="w-5 h-5" /> Configuración
                    </RouterLink>
                </li>
            </ul>
            <div class="mt-auto pt-6 text-xs text-gray-400 font-medium text-center">Versión 1.0</div>
            <button @click="menuAbierto = false" class="md:hidden absolute top-4 right-4 text-xl">✕</button>
        </nav>

        <div v-if="menuAbierto" @click="menuAbierto = false" class="md:hidden fixed inset-0 bg-black/50 z-40"></div>

        <main class="p-4 md:ml-64 md:p-12">
            <header class="mb-8">
                <h2 class="text-3xl font-bold text-gray-800">Hola, UsuarioV1! </h2>
                <p class="text-gray-500 font-medium">Bienvenido a tu panel financiero</p>
            </header>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-[#0332fd] rounded-3xl p-8 text-white shadow-lg flex flex-col justify-between">
                    <div>
                        <p class="text-sm opacity-80 uppercase tracking-widest flex items-center gap-2">
                            <WalletIcon class="w-5 h-5" /> Saldo disponible
                        </p>
                        <h1 class="text-4xl font-bold mt-2">Bs. {{ store.saldo.toFixed(2) }}</h1>
                    </div>
                    <div class="flex gap-6 mt-8 pt-6 border-t border-white/20">
                        <div>
                            <p class="text-xs opacity-70">Ingresos</p>
                            <p class="font-bold text-lg">Bs. {{ store.totalIngresos.toFixed(2) }}</p>
                        </div>
                        <div>
                            <p class="text-xs opacity-70">Egresos</p>
                            <p class="font-bold text-lg">Bs. {{ store.totalEgresos.toFixed(2) }}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <GraficaGastos v-if="store.historial.length > 0" modo="resumen" />
                    <p v-else class="text-gray-400">Sin movimientos para graficar</p>
                </div>
            </div>

            <section class="bg-blue-600 p-6 rounded-3xl shadow-sm text-white flex items-center gap-4 mb-8">
    <div class="text-3xl bg-blue-500/30 p-3 rounded-2xl">{{ store.auditoria.emoji }}</div>
    <div>
        <h3 class="font-bold text-lg">{{ store.auditoria.titulo }}</h3>
        <p class="text-blue-100 text-sm opacity-90">{{ store.auditoria.mensaje }}</p>
    </div>
</section>

            <div class="flex gap-4 mb-8">
                <button @click="tipoSeleccionado = 'Ingreso'"
                    class="flex-1 flex items-center justify-center gap-2 bg-[#5895eb] text-white py-4 rounded-2xl font-bold hover:bg-[#0332fd] transition shadow-md">
                    <PlusCircleIcon class="w-5 h-5" /> Ingreso
                </button>
                <button @click="tipoSeleccionado = 'Egreso'"
                    class="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition shadow-md">
                    <MinusCircleIcon class="w-5 h-5" /> Egreso
                </button>
            </div>

            <div v-if="tipoSeleccionado" class="bg-white p-6 rounded-3xl mb-8 border border-gray-100 shadow-sm">
                <h4 class="font-bold mb-4 text-[#0332fd] uppercase text-sm">Nuevo {{ tipoSeleccionado }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div v-if="tipoSeleccionado === 'Egreso'" class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400">Categoría</label>
                        <select v-model="categoriaInput" class="p-3 border border-gray-100 rounded-2xl bg-gray-50">
                            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>
                    <div v-if="tipoSeleccionado === 'Egreso'" class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400">Descripción</label>
                        <input v-model="descInput" type="text" class="p-3 border border-gray-100 rounded-2xl bg-gray-50"
                            placeholder="Ej. Almuerzo" />
                    </div>
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400">Monto (Bs.)</label>
                        <input v-model="montoInput" type="number"
                            class="p-3 border border-gray-100 rounded-2xl bg-gray-50" placeholder="0.00" />
                    </div>
                    <button @click="ejecutarAccion"
                        class="h-12 bg-[#0332fd] text-white rounded-2xl font-bold hover:bg-[#1e26bb] transition">Confirmar</button>
                </div>
            </div>

            <section class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800">Historial reciente</h3>
                    <button @click="store.limpiarHistorial()"
                        class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition">
                        <TrashIcon class="w-4 h-4" /> Limpiar todo
                    </button>
                </div>

                <div <div
                    class="space-y-3 max-h-100 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div v-if="store.historial.length === 0" class="text-center py-10 text-gray-400">
                        No hay movimientos recientes
                    </div>

                    <div v-for="mov in store.historial" :key="mov.id"
                        class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <p class="font-medium text-gray-700">{{ mov.descripcion || mov.categoria }}</p>
                            <p class="text-xs text-gray-400">{{ mov.categoria }}</p>
                        </div>
                        <span :class="mov.tipo === 'Ingreso' ? 'text-[#0332fd]' : 'text-red-500'" class="font-bold">
                            {{ mov.tipo === 'Ingreso' ? '+' : '-' }} Bs. {{ mov.monto.toFixed(2) }}
                        </span>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>