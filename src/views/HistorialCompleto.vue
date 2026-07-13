<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useMovimientosStore } from '../stores/movimientosStore';
import { useUiStore } from '../stores/uiStore';
import logoImg from '../assets/logo-gestio.png';
import GraficaGastos from '../components/GraficaGastos.vue';
import {
    ChartBarIcon,
    Cog6ToothIcon,
    DocumentTextIcon,
    FunnelIcon,
    ShieldCheckIcon
} from '@heroicons/vue/24/outline';

const movStore = useMovimientosStore();
const uiStore = useUiStore();
const menuAbierto = ref(false);

// Listas de categorías organizadas
const categoriasIngreso = ['Sueldo', 'Trabajo', 'Emprendimiento', 'Regalo'];
const categoriasEgreso = ['Hogar', 'Comida', 'Salida', 'Ropa', 'Transporte', 'Salud', 'Educación', 'Ahorro', 'Otros'];

// Lógica para filtrar el select de categorías según el tipo
const categoriasFiltradas = computed(() => {
    if (uiStore.filtroTipo === 'Ingreso') return categoriasIngreso;
    if (uiStore.filtroTipo === 'Egreso') return categoriasEgreso;
    return [...categoriasIngreso, ...categoriasEgreso];
});



// Resetear filtro de categoría al cambiar de Tipo
watch(() => uiStore.filtroTipo, () => {
    uiStore.filtroCategoria = 'Todas';
});
</script>

<template>
    <div class="min-h-screen bg-gray-50 text-gray-800 font-sans">

        <!-- Mobile Header -->
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

        <!-- Sidebar -->
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
            <div class="mt-auto pt-6 text-xs text-gray-400 font-medium text-center">Versión 1.2.0</div>
            <button @click="menuAbierto = false" class="md:hidden absolute top-4 right-4 text-xl">✕</button>
        </nav>


        <div v-if="menuAbierto" @click="menuAbierto = false" class="md:hidden fixed inset-0 bg-black/50 z-40"></div>

        <!-- Main Content -->
        <main class="p-4 md:ml-64 md:p-12">
            <header class="mb-8 flex items-center gap-3">
                <DocumentTextIcon class="w-8 h-8 text-[#0332fd]" />
                <h2 class="text-3xl font-bold text-gray-800">Movimientos</h2>
            </header>

            <!-- Cards Resumen -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p class="text-gray-400 text-xs font-bold uppercase mb-1">Ingresos</p>
                    <p class="text-2xl font-bold text-[#0332fd]">{{ uiStore.formatearBs(movStore.totalIngresos) }}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p class="text-gray-400 text-xs font-bold uppercase mb-1">Egresos</p>
                    <p class="text-2xl font-bold text-red-500">{{ uiStore.formatearBs(movStore.totalEgresos) }}</p>
                </div>
                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <p class="text-gray-400 text-xs font-bold uppercase mb-1">Balance</p>
                    <p class="text-2xl font-bold text-gray-800">{{ uiStore.formatearBs(movStore.saldo) }}</p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Gráfica -->
                <section class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 class="text-lg font-bold mb-4">Análisis visual</h3>
                    <GraficaGastos modo="detalle" />
                </section>

                <!-- Filtros -->
                <section class="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
                        <FunnelIcon class="w-5 h-5 text-gray-500" /> Filtros Avanzados
                    </h3>

                    <!-- Cambié grid-cols-3 por grid-cols-1 para que queden verticales -->
                    <div class="grid grid-cols-1 gap-4">

                        <!-- Contenedor individual para cada select -->
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-bold text-gray-400 uppercase">Tipo</label>
                            <select v-model="uiStore.filtroTipo"
                                class="w-full p-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm">
                                <option>Todos</option>
                                <option>Ingreso</option>
                                <option>Egreso</option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-bold text-gray-400 uppercase">Categoría</label>
                            <select v-model="uiStore.filtroCategoria"
                                class="w-full p-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm">
                                <option>Todas</option>
                                <option v-for="c in categoriasFiltradas" :key="c" :value="c">
                                    {{ c }}
                                </option>
                            </select>
                        </div>

                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-bold text-gray-400 uppercase">Tiempo</label>
                            <select v-model="uiStore.filtroTiempo"
                                class="w-full p-3 border border-gray-100 rounded-2xl bg-gray-50 text-sm">
                                <option>Todo</option>
                                <option>Hoy</option>
                                <option>Semana</option>
                                <option>Mes</option>
                            </select>
                        </div>

                    </div>
                </section>
            </div>

            <!-- Tabla de Historial -->
            <div class="p-4 sm:p-6 w-full">

                <div class="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">

                    <h2 class="text-xl font-bold text-gray-800">Historial Detallado</h2>

                    <button @click="movStore.descargarAuditoria()"
                        class="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0332fd] hover:bg-blue-800 text-white font-medium py-2.5 px-6 rounded-2xl shadow-md transition-all active:scale-95 duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>Generar Reporte</span>
                    </button>
                </div>

                <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div class="overflow-x-auto custom-scrollbar max-h-125">
                        <table class="w-full text-left text-sm">
                            <thead class="bg-gray-50 text-gray-400 text-xs uppercase sticky top-0 z-10">
                                <tr>
                                    <th class="p-4">Fecha</th>
                                    <th class="p-4">Categoría</th>
                                    <th class="p-4">Descripción</th>
                                    <th class="p-4 text-right">Ingreso</th>
                                    <th class="p-4 text-right">Egreso</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                                <tr v-if="uiStore.historialFiltrado.length === 0">
                                    <td colspan="5" class="p-8 text-center text-gray-400 italic">No hay movimientos.
                                    </td>
                                </tr>
                                <tr v-for="mov in uiStore.historialFiltrado" :key="mov.id"
                                    class="hover:bg-gray-50 transition">
                                    <td class="p-4 text-gray-500 whitespace-nowrap">
                                        {{ new Date(mov.fecha).toLocaleDateString('es-VE', {
                                            day: '2-digit', month:
                                        '2-digit' }) }}
                                    </td>
                                    <td class="p-4 font-medium text-gray-700 whitespace-nowrap">{{ mov.categoria }}</td>
                                    <td class="p-4 text-gray-600 min-w-37.5">{{ mov.descripcion }}</td>
                                    <td class="p-4 text-right text-[#0332fd] font-bold whitespace-nowrap">
                                        {{ mov.tipo === 'Ingreso' ? uiStore.formatearBs(mov.monto) : '-' }}
                                    </td>
                                    <td class="p-4 text-right text-red-500 font-bold whitespace-nowrap">
                                        {{ mov.tipo === 'Egreso' ? uiStore.formatearBs(mov.monto) : '-' }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>
</template>

<style>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e5e7eb;
    border-radius: 10px;
}
</style>