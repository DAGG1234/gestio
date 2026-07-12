import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface IMovimiento {
    id: number;
    tipo: 'Ingreso' | 'Egreso';
    categoria: string;
    descripcion: string;
    monto: number;
    fecha: string;
}

export const useMovimientosStore = defineStore('movimientos', () => {
    // 1. Estado base (La fuente única de la verdad)
    const saved = localStorage.getItem('gestio_historial');
    const historial = ref<IMovimiento[]>(saved ? JSON.parse(saved) : []);

    // 2. Estado de Filtro (Solo afecta a la vista de Auditoría)
    const filtroTipo = ref<'Todos' | 'Ingreso' | 'Egreso'>('Todos');

    function sincronizar() {
        localStorage.setItem('gestio_historial', JSON.stringify(historial.value));
    }

    function agregarMovimiento(mov: Omit<IMovimiento, 'id' | 'fecha'>) {
        historial.value.push({ ...mov, id: Date.now(), fecha: new Date().toISOString() });
        sincronizar();
    }

    function limpiarHistorial() {
        historial.value = [];
        sincronizar();
    }

    // 3. Setters para filtros
    function establecerFiltro(tipo: 'Todos' | 'Ingreso' | 'Egreso') {
        filtroTipo.value = tipo;
    }

    // 4. Computados para Dashboard (IGNORAN el filtro)
    const totalIngresos = computed(() => historial.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresos = computed(() => historial.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));
    const saldo = computed(() => totalIngresos.value - totalEgresos.value);

    // 5. Computado para Auditoría (RESPETA el filtro)
    const historialFiltrado = computed(() => {
        if (filtroTipo.value === 'Todos') return historial.value;
        return historial.value.filter(m => m.tipo === filtroTipo.value);
    });

    return { 
        historial, 
        historialFiltrado,
        filtroTipo,
        totalIngresos, 
        totalEgresos, 
        saldo, 
        agregarMovimiento, 
        limpiarHistorial,
        establecerFiltro
    };
});