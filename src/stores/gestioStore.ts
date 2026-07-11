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

// Función auxiliar para formato de moneda venezolana
export const formatearBs = (monto: number) => {
    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(monto) + ' Bs.';
};

export const useGestioStore = defineStore('gestio', () => {
    const saved = localStorage.getItem('gestio_historial');
    const historial = ref<IMovimiento[]>(saved ? JSON.parse(saved) : []);
    
    // Estado para notificaciones
    const mensajeNotificacion = ref<string | null>(null);

    const filtroTipo = ref('Todos');
    const filtroCategoria = ref('Todas');
    const filtroTiempo = ref('Todo');

    function sincronizar() {
        localStorage.setItem('gestio_historial', JSON.stringify(historial.value));
    }

    function mostrarNotificacion(msg: string) {
        mensajeNotificacion.value = msg;
        setTimeout(() => { mensajeNotificacion.value = null; }, 3000);
    }

    function agregarMovimiento(tipo: 'Ingreso' | 'Egreso', categoria: string, descripcion: string, monto: number) {
        if (monto > 100000000) {
            mostrarNotificacion("Error: Monto demasiado alto.");
            return;
        }

        if (tipo === 'Egreso' && monto > saldo.value) {
            mostrarNotificacion("⚠️ Cuidado: Saldo insuficiente.");
            return;
        }

        historial.value.push({
            id: Date.now(),
            tipo,
            categoria,
            descripcion,
            monto,
            fecha: new Date().toISOString()
        });
        
        sincronizar();
        mostrarNotificacion("¡Movimiento registrado con éxito!");
    }

    function limpiarHistorial() {
        historial.value = [];
        sincronizar();
        mostrarNotificacion("Historial limpiado.");
    }

    // Cálculos globales
    const totalIngresos = computed(() => historial.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresos = computed(() => historial.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));
    const saldo = computed(() => totalIngresos.value - totalEgresos.value);

    // Lógica de filtrado
    const historialFiltrado = computed(() => {
        let filtrado = historial.value;

        if (filtroTipo.value !== 'Todos') filtrado = filtrado.filter(m => m.tipo === filtroTipo.value);
        if (filtroCategoria.value !== 'Todas') filtrado = filtrado.filter(m => m.categoria === filtroCategoria.value);

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

    const totalIngresosFiltrados = computed(() => historialFiltrado.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresosFiltrados = computed(() => historialFiltrado.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));

    // Auditoría mejorada
    const auditoria = computed(() => {
        const egresos = historial.value.filter(m => m.tipo === 'Egreso');
        if (egresos.length === 0) return { titulo: "¡Todo listo!", mensaje: "Registra tu primer gasto.", emoji: "🚀" };
        if (totalEgresos.value > totalIngresos.value) return { titulo: "¡Alerta Roja!", mensaje: "Gastos superiores a ingresos.", emoji: "⚠️" };
        return { titulo: "Salud financiera estable", mensaje: "Tus gastos están controlados.", emoji: "✨" };
    });

    return {
        historial,
        filtroTipo,
        filtroCategoria,
        filtroTiempo,
        mensajeNotificacion,
        agregarMovimiento,
        limpiarHistorial,
        auditoria,
        historialFiltrado,
        totalIngresos,
        totalEgresos,
        saldo,
        totalIngresosFiltrados,
        totalEgresosFiltrados,
        formatearBs
    };
});