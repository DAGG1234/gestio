<script setup lang="ts">
import { ref } from "vue";
import { useMovimientosStore } from "../stores/movimientosStore";
import { useUiStore } from "../stores/uiStore";
import { useUserStore } from "../stores/userStore";
import logoImg from "../assets/logo-gestio.png";
import GraficaGastos from "../components/GraficaGastos.vue";
import {
    ChartBarIcon,
    ShieldCheckIcon,
    Cog6ToothIcon,
    WalletIcon,
    PlusCircleIcon,
    MinusCircleIcon,
    TrashIcon,
} from "@heroicons/vue/24/outline";

// Instancias de los nuevos almacenes divididos
const movStore = useMovimientosStore();
const uiStore = useUiStore();
const userStore = useUserStore();
const menuAbierto = ref(false);
const tipoSeleccionado = ref<"Ingreso" | "Egreso" | null>(null);
const montoInput = ref<number | null>(null);
const descInput = ref("");

// Configuración de categorías dinámicas
const categoriaInput = ref("");
const categoriasEgreso = [
    "Hogar",
    "Comida",
    "Salida",
    "Ropa",
    "Transporte",
    "Salud",
    "Educación",
];
const categoriasIngreso = ["Sueldo", "Trabajo", "Emprendimiento", "Regalo"];

// Cambiar de modo limpia inputs y asigna categoría por defecto
const seleccionarTipo = (tipo: "Ingreso" | "Egreso") => {
    tipoSeleccionado.value = tipo;
    categoriaInput.value = tipo === "Ingreso" ? categoriasIngreso[0] : categoriasEgreso[0];
    montoInput.value = null;
    descInput.value = "";
};

// Validación definitiva: Solo números y un punto decimal
const soloNumeros = (event: KeyboardEvent) => {
    if (!/[0-9.]/.test(event.key)) {
        event.preventDefault();
    }
};

const ejecutarAccion = () => {
    const monto = montoInput.value;
    if (!monto || monto <= 0) return;

    // Validación de seguridad de negocio cruzando ambos stores
    if (monto > 100000000) {
        uiStore.mostrarNotificacion("❌ Error: Monto demasiado alto.");
        return;
    }

    if (tipoSeleccionado.value === "Egreso" && monto > movStore.saldo) {
        uiStore.mostrarNotificacion("⚠️ Cuidado: Saldo insuficiente.");
        return;
    }

    // Guardado de datos limpio en el almacén de movimientos
    movStore.agregarMovimiento({
        tipo: tipoSeleccionado.value!,
        categoria: categoriaInput.value,
        descripcion: descInput.value.trim() || tipoSeleccionado.value!,
        monto: monto,
    });

    uiStore.mostrarNotificacion("¡Movimiento registrado con éxito!");

    // Resetear formulario
    tipoSeleccionado.value = null;
    montoInput.value = null;
    descInput.value = "";
};
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
            <div class="mt-auto pt-6 text-xs text-gray-400 font-medium text-center">
                Versión 1.2.0
            </div>
            <button @click="menuAbierto = false" class="md:hidden absolute top-4 right-4 text-xl">
                ✕
            </button>
        </nav>

        <div v-if="menuAbierto" @click="menuAbierto = false" class="md:hidden fixed inset-0 bg-black/50 z-40"></div>

        <main class="p-4 md:ml-64 md:p-12">
            <header class="mb-8">
                <h2 class="text-2xl font-bold text-gray-800">Hola, {{ userStore.nombre }}</h2>
                <p class="text-gray-500 font-medium">Bienvenido a tu panel financiero</p>
            </header>

            <!-- Cards Globales -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div class="bg-[#0332fd] rounded-3xl p-8 text-white shadow-lg flex flex-col justify-between">
                    <div>
                        <p class="text-sm opacity-80 uppercase tracking-widest flex items-center gap-2">
                            <WalletIcon class="w-5 h-5" /> Saldo disponible
                        </p>
                        <h1 class="text-4xl font-bold mt-2">
                            {{ uiStore.formatearBs(movStore.saldo) }}
                        </h1>
                    </div>
                    <div class="flex gap-6 mt-8 pt-6 border-t border-white/20">
                        <div>
                            <p class="text-xs opacity-70">Ingresos</p>
                            <p class="font-bold text-lg">
                                {{ uiStore.formatearBs(movStore.totalIngresos) }}
                            </p>
                        </div>
                        <div>
                            <p class="text-xs opacity-70">Egresos</p>
                            <p class="font-bold text-lg">
                                {{ uiStore.formatearBs(movStore.totalEgresos) }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center">
                    <GraficaGastos v-if="movStore.historial.length > 0" modo="resumen" />
                    <p v-else class="text-gray-400">Sin movimientos para graficar</p>
                </div>
            </div>

            <!-- Auditoria Computada desde la UI -->
            <section :key="movStore.saldo" :class="uiStore.auditoria.claseColor"
                class="p-6 rounded-3xl shadow-sm text-white flex items-center gap-4 mb-8 transition-colors duration-500">
                <div class="text-white bg-black/10 p-3 rounded-2xl flex items-center justify-center"
                    v-html="uiStore.auditoria.iconoSvg"></div>

                <div>
                    <h3 class="font-bold text-lg">{{ uiStore.auditoria.titulo }}</h3>
                    <p class="text-white/90 text-sm opacity-90">{{ uiStore.auditoria.mensaje }}</p>
                </div>
            </section>

            <!-- Botonera de Selección -->
            <div class="flex gap-4 mb-8">
                <button @click="seleccionarTipo('Ingreso')"
                    class="flex-1 flex items-center justify-center gap-2 bg-[#5895eb] text-white py-4 rounded-2xl font-bold hover:bg-[#0332fd] transition shadow-md">
                    <PlusCircleIcon class="w-5 h-5" /> Ingreso
                </button>
                <button @click="seleccionarTipo('Egreso')"
                    class="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-4 rounded-2xl font-bold hover:bg-red-600 transition shadow-md">
                    <MinusCircleIcon class="w-5 h-5" /> Egreso
                </button>
            </div>

            <!-- Formulario Unificado Exclusivo de Entrada de Datos -->
            <div v-if="tipoSeleccionado" class="bg-white p-6 rounded-3xl mb-8 border border-gray-100 shadow-sm">
                <h4 class="font-bold mb-4 text-[#0332fd] uppercase text-sm">
                    Nuevo {{ tipoSeleccionado }}
                </h4>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400">Categoría de {{ tipoSeleccionado }}</label>
                        <select v-model="categoriaInput" class="p-3 border border-gray-100 rounded-2xl bg-gray-50">
                            <option v-for="cat in tipoSeleccionado === 'Ingreso'
                                ? categoriasIngreso
                                : categoriasEgreso" :key="cat" :value="cat">
                                {{ cat }}
                            </option>
                        </select>
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400">Descripción / Detalles</label>
                        <input v-model="descInput" type="text" class="p-3 border border-gray-100 rounded-2xl bg-gray-50"
                            placeholder="Ej. Pago de servicios / Abono" />
                    </div>

                    <div class="flex flex-col gap-1">
                        <label class="text-xs font-semibold text-gray-400">Monto (Bs.)</label>
                        <input v-model="montoInput" type="number" min="0" step="any" @keypress="soloNumeros"
                            class="p-3 border border-gray-100 rounded-2xl bg-gray-50" placeholder="0.00" />
                    </div>

                    <button @click="ejecutarAccion"
                        class="h-12 bg-[#0332fd] text-white rounded-2xl font-bold hover:bg-[#1e26bb] transition">
                        Confirmar
                    </button>
                </div>
            </div>

            <!-- Historial Reactivo obtenido a través de uiStore -->
            <section class="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-gray-800">Historial reciente</h3>
                    <button @click="movStore.limpiarHistorial()"
                        class="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition">
                        <TrashIcon class="w-4 h-4" /> Limpiar todo
                    </button>
                </div>

                <div class="space-y-3 max-h-100 overflow-y-auto pr-2 scrollbar-thin">
                    <div v-if="uiStore.historialFiltrado.length === 0" class="text-center py-10 text-gray-400">
                        No hay movimientos registrados
                    </div>
                    <div v-for="mov in uiStore.historialFiltrado" :key="mov.id"
                        class="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <p class="font-medium text-gray-700">{{ mov.descripcion }}</p>
                            <p class="text-xs text-gray-400">{{ mov.categoria }}</p>
                        </div>
                        <span :class="mov.tipo === 'Ingreso' ? 'text-[#0332fd]' : 'text-red-500'" class="font-bold">
                            {{ mov.tipo === "Ingreso" ? "+" : "-" }}
                            {{ uiStore.formatearBs(mov.monto) }}
                        </span>
                    </div>
                </div>
            </section>
        </main>

        <!-- Toast Renderizado desde uiStore -->
        <div v-if="uiStore.mensajeNotificacion"
            class="fixed bottom-5 right-5 bg-gray-800 text-white px-6 py-3 rounded-2xl shadow-xl z-50 animate-bounce">
            {{ uiStore.mensajeNotificacion }}
        </div>
    </div>
</template>
