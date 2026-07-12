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
    const saved = localStorage.getItem('gestio_historial');
    const historial = ref<IMovimiento[]>(saved ? JSON.parse(saved) : []);

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

    const totalIngresos = computed(() => historial.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresos = computed(() => historial.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));
    const saldo = computed(() => totalIngresos.value - totalEgresos.value);

    return { historial, totalIngresos, totalEgresos, saldo, agregarMovimiento, limpiarHistorial };
});