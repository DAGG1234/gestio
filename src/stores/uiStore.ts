import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useMovimientosStore } from './movimientosStore';

export const useUiStore = defineStore('ui', () => {
    const movStore = useMovimientosStore();

    // Estados
    const mensajeNotificacion = ref<string | null>(null);
    const filtroTipo = ref('Todos');
    const filtroCategoria = ref('Todas');
    const filtroTiempo = ref('Todo');

    // Acciones
    function mostrarNotificacion(msg: string) {
        mensajeNotificacion.value = msg;
        setTimeout(() => { mensajeNotificacion.value = null; }, 3000);
    }

    // Utilidades
    const formatearBs = (monto: number) => {
        return new Intl.NumberFormat('es-VE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(monto) + ' Bs.';
    };

    // Computados
    const historialFiltrado = computed(() => {
        let filtrado = [...movStore.historial].reverse();

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
            filtrado = filtrado.filter(m => {
                const d = new Date(m.fecha);
                return d.getMonth() === hoy.getMonth() && d.getFullYear() === hoy.getFullYear();
            });
        }

        return filtrado;
    });

    const auditoria = computed(() => {
        const totalIng = movStore.totalIngresos;
        const totalEgr = movStore.totalEgresos;
        const saldo = movStore.saldo;

        // SVG para cada estado
        const svgRocket = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`;
        const svgAlert = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
        const svgScale = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l3-9a9 9 0 015.636 1.319M16 12l2 2m0 0l2 2m-2-2l-2 2m2-2l2-2m-2 2H6m6 0H6m0 0H3m3 0l3 9m3-9h6m2 0H3"/></svg>`;
        const svgCheck = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;

        if (movStore.historial.length === 0)
            return { titulo: "¡Todo listo!", mensaje: "Registra tu primer movimiento.", iconoSvg: svgRocket, claseColor: "bg-blue-600" };

        if (totalEgr > totalIng)
            return { titulo: "¡Alerta Roja!", mensaje: "Tus gastos superan tus ingresos.", iconoSvg: svgAlert, claseColor: "bg-red-600" };

        const porcentajeDisponible = totalIng > 0 ? (saldo / totalIng) * 100 : 0;

        if (porcentajeDisponible <= 5)
            return { titulo: "¡Presupuesto crítico!", mensaje: "Te queda muy poco.", iconoSvg: svgAlert, claseColor: "bg-red-500" };

        if (porcentajeDisponible <= 20)
            return { titulo: "Controla tus gastos", mensaje: "Te queda poco margen disponible.", iconoSvg: svgAlert, claseColor: "bg-amber-500" };

        if (porcentajeDisponible <= 50)
            return { titulo: "Presupuesto a la mitad", mensaje: "Tienes la mitad de tus ingresos disponible.", iconoSvg: svgScale, claseColor: "bg-blue-500" };

        return { titulo: "Salud financiera estable", mensaje: "Vas muy bien con tus finanzas.", iconoSvg: svgCheck, claseColor: "bg-emerald-500" };
    });

    return {
        mensajeNotificacion,
        filtroTipo,
        filtroCategoria,
        filtroTiempo,
        mostrarNotificacion,
        formatearBs,
        historialFiltrado,
        auditoria
    };
});