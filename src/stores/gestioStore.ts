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

export const useGestioStore = defineStore('gestio', () => {
    // 1. Historial RECIENTE (Se limpia con el botón)
    const savedReciente = localStorage.getItem('gestio_reciente');
    const historial = ref<IMovimiento[]>(savedReciente ? JSON.parse(savedReciente) : []);
    
    // 2. Historial TOTAL (Se mantiene para cálculos y auditoría)
    const savedTotal = localStorage.getItem('gestio_total');
    const historialTotal = ref<IMovimiento[]>(savedTotal ? JSON.parse(savedTotal) : []);
    
    const filtroTipo = ref('Todos');
    const filtroCategoria = ref('Todas');
    const filtroTiempo = ref('Todo');

    function sincronizar() {
        localStorage.setItem('gestio_reciente', JSON.stringify(historial.value));
        localStorage.setItem('gestio_total', JSON.stringify(historialTotal.value));
    }

    function agregarMovimiento(tipo: 'Ingreso' | 'Egreso', categoria: string, descripcion: string, monto: number) {
        const nuevo: IMovimiento = {
            id: Date.now(),
            tipo,
            categoria,
            descripcion,
            monto,
            fecha: new Date().toISOString()
        };
        
        historial.value.push(nuevo);
        historialTotal.value.push(nuevo);
        sincronizar(); 
    }

    // AHORA: Solo limpia el historial de pantalla
    function limpiarHistorial() {
        historial.value = [];
        sincronizar(); 
    }

    // Auditoría basada en historialTotal (No se borra)
    const auditoria = computed(() => {
        const egresos = historialTotal.value.filter(m => m.tipo === 'Egreso');
        if (egresos.length === 0) return "¡Empecemos! Registra tu primer gasto para ver tu salud financiera.";

        const maxGasto = egresos.reduce((prev, current) => (prev.monto > current.monto) ? prev : current);

        if (totalIngresos.value > 0 && maxGasto.monto > (totalIngresos.value * 0.4)) {
            return `¡Cuidado! Tu mayor gasto fue en ${maxGasto.categoria} (Bs. ${maxGasto.monto}). Representa más del 40% de tus ingresos.`;
        }

        return "Vas por buen camino. Tus gastos están distribuidos de forma saludable.";
    });

    // Filtros de pantalla (Se mantienen igual para el historial reciente)
    const historialFiltrado = computed(() => {
        let filtrado = historial.value;

        if (filtroTipo.value !== 'Todos') {
            filtrado = filtrado.filter(m => m.tipo === filtroTipo.value);
        }

        if (filtroCategoria.value !== 'Todas') {
            filtrado = filtrado.filter(m => m.categoria === filtroCategoria.value);
        }

        const hoy = new Date();
        if (filtroTiempo.value === 'Hoy') {
            filtrado = filtrado.filter(m => new Date(m.fecha).toDateString() === hoy.toDateString());
        } else if (filtroTiempo.value === 'Semana') {
            const sieteDiasAtras = new Date();
            sieteDiasAtras.setDate(hoy.getDate() - 7);
            filtrado = filtrado.filter(m => new Date(m.fecha) >= sieteDiasAtras);
        } else if (filtroTiempo.value === 'Mes') {
            filtrado = filtrado.filter(m =>
                new Date(m.fecha).getMonth() === hoy.getMonth() &&
                new Date(m.fecha).getFullYear() === hoy.getFullYear()
            );
        }

        return filtrado;
    });

    // Cálculos basados en historialTotal (No se borran)
    const totalIngresos = computed(() => historialTotal.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresos = computed(() => historialTotal.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));
    const saldo = computed(() => totalIngresos.value - totalEgresos.value);

    // Cálculos para filtros de pantalla
    const totalIngresosFiltrados = computed(() => historialFiltrado.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresosFiltrados = computed(() => historialFiltrado.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));

    return {
        historial,
        historialTotal, // Se incluye por si lo necesitas en algún componente
        filtroTipo,
        filtroCategoria,
        filtroTiempo,
        agregarMovimiento,
        limpiarHistorial,
        auditoria,
        historialFiltrado,
        totalIngresos,
        totalEgresos,
        saldo,
        totalIngresosFiltrados,
        totalEgresosFiltrados
    };
});