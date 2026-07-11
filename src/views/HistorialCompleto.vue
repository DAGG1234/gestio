<script setup lang="ts">
import { ref } from 'vue';
import { useGestioStore } from '../stores/gestioStore';
import logoImg from '../assets/logo-gestio.png';
import GraficaGastos from '../components/GraficaGastos.vue';
import {
    ChartBarIcon,
    ShieldCheckIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    FunnelIcon
} from '@heroicons/vue/24/outline';

const store = useGestioStore();
const menuAbierto = ref(false);
const categorias = ['Hogar', 'Comida', 'Salida', 'Ropa', 'Transporte', 'Salud', 'Educación'];
</script>

<template>
    <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">

        <!-- HEADER MÓVIL -->
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

        <!-- NAV LATERAL -->
        <nav class="fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 p-6 z-50 transition-transform duration-300 md:translate-x-0 flex flex-col"
            :class="menuAbierto ? 'translate-x-0' : '-translate-x-full'">
            <div class="flex items-center gap-2 mb-10">
                <img :src="logoImg" alt="Logo" class="w-15 h-15" />
                <h2 class="text-2xl font-bold text-[#0332fd]">GESTIO</h2>
            </div>
            <ul class="space-y-4">
                <li>
                    <RouterLink to="/"
                        class="flex items-center gap-3 text-gray-400 hover:text-gray-800 transition pl-4 py-2">
                        <ChartBarIcon class="w-5 h-5" /> Dashboard
                    </RouterLink>
                </li>
                <li>
                    <RouterLink to="/auditoria" active-class="font-bold text-[#0332fd] border-l-4 border-[#0332fd]"
                        class="flex items-center gap-3 font-bold text-[#0332fd] border-l-4 border-[#0332fd] pl-4 py-2">
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

        <!-- CONTENIDO -->
        <main class="p-4 md:ml-64 md:p-12">
            <header class="mb-8 flex items-center gap-3">
                <DocumentTextIcon class="w-8 h-8 text-[#0332fd]" />
                <h2 class="text-3xl font-bold text-gray-800">Movimientos</h2>
            </header>

            <!-- TOTALES -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p class="text-gray-400 text-xs font-bold uppercase mb-1">Ingresos</p>
                    <p class="text-2xl font-bold text-[#0332fd]">Bs. {{ store.totalIngresosFiltrados.toFixed(2) }}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p class="text-gray-400 text-xs font-bold uppercase mb-1">Egresos</p>
                    <p class="text-2xl font-bold text-red-500">Bs. {{ store.totalEgresosFiltrados.toFixed(2) }}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p class="text-gray-400 text-xs font-bold uppercase mb-1">Balance</p>
                    <p class="text-2xl font-bold text-gray-800">Bs. {{ (store.totalIngresosFiltrados -
                        store.totalEgresosFiltrados).toFixed(2) }}</p>
                </div>
            </div>

            <!-- FILTROS Y GRÁFICA -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <section class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 class="text-lg font-bold mb-4">Análisis visual</h3>
                    <GraficaGastos modo="detalle" />
                </section>

                <section class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <FunnelIcon class="w-5 h-5 text-gray-500" /> Filtros
                    </h3>
                    <div class="flex flex-col gap-4">
                        <select v-model="store.filtroTipo"
                            class="w-full p-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm">
                            <option>Todos</option>
                            <option>Ingreso</option>
                            <option>Egreso</option>
                        </select>
                        <select v-model="store.filtroCategoria"
                            class="w-full p-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm">
                            <option>Todas</option>
                            <option v-for="c in categorias" :key="c">{{ c }}</option>
                        </select>
                        <select v-model="store.filtroTiempo"
                            class="w-full p-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm">
                            <option>Todo</option>
                            <option>Hoy</option>
                            <option>Semana</option>
                            <option>Mes</option>
                        </select>
                    </div>
                </section>
            </div>

            <!-- TABLA -->
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
                <table class="w-full text-left text-sm">
                    <thead class="bg-gray-50 text-gray-400 text-xs uppercase">
                        <tr>
                            <th class="p-4">Fecha</th>
                            <th class="p-4">Categoría</th>
                            <th class="p-4">Descripción</th>
                            <th class="p-4 text-right">Ingreso</th>
                            <th class="p-4 text-right">Egreso</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="mov in store.historialFiltrado" :key="mov.id">
                            <td class="p-4 text-gray-500 whitespace-nowrap">{{ new
                                Date(mov.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) }}
                            </td>
                            <td class="p-4 font-medium">{{ mov.categoria }}</td>
                            <td class="p-4 text-gray-600">{{ mov.descripcion }}</td>
                            <td class="p-4 text-right text-[#0332fd] font-bold">{{ mov.tipo === 'Ingreso' ?
                                mov.monto.toFixed(2) : '' }}</td>
                            <td class="p-4 text-right text-red-500 font-bold">{{ mov.tipo === 'Egreso' ?
                                mov.monto.toFixed(2) : '' }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </main>
    </div>
</template>