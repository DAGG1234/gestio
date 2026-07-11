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
    const saved = localStorage.getItem('gestio_historial');
    const historial = ref<IMovimiento[]>(saved ? JSON.parse(saved) : []);

    const filtroTipo = ref('Todos');
    const filtroCategoria = ref('Todas');
    const filtroTiempo = ref('Todo');

    function sincronizar() {
        localStorage.setItem('gestio_historial', JSON.stringify(historial.value));
    }

    function agregarMovimiento(tipo: 'Ingreso' | 'Egreso', categoria: string, descripcion: string, monto: number) {
        historial.value.push({
            id: Date.now(),
            tipo,
            categoria,
            descripcion,
            monto,
            fecha: new Date().toISOString()
        });
        sincronizar();
    }

    function limpiarHistorial() {
        historial.value = [];
        sincronizar();
    }

    const auditoria = computed(() => {
        const egresos = historial.value.filter(m => m.tipo === 'Egreso');
        const totalIng = totalIngresos.value;
        const totalEgr = totalEgresos.value;

        if (egresos.length === 0) {
            return {
                titulo: "¡Todo listo!",
                mensaje: "No tienes egresos registrados aún. ¡Registra tu primer gasto para empezar a controlar tu salud financiera!",
                emoji: "🚀"
            };
        }

        const maxGasto = egresos.reduce((prev, current) => (prev.monto > current.monto) ? prev : current);
        const porcentajeGasto = (maxGasto.monto / (totalIng > 0 ? totalIng : 1)) * 100;

        if (totalIng > 0 && totalEgr > totalIng) {
            return {
                titulo: "¡Alerta Roja!",
                mensaje: "Estás gastando más de lo que ingresas. Necesitas recortar gastos urgentemente.",
                emoji: "⚠️"
            };
        }

        if (porcentajeGasto > 50) {
            return {
                titulo: "Gasto elevado detectado",
                mensaje: `Cuidado: Tu gasto en ${maxGasto.categoria} representa el ${porcentajeGasto.toFixed(0)}% de tus ingresos. Es un monto muy alto.`,
                emoji: "🧐"
            };
        }

        return {
            titulo: "Salud financiera estable",
            mensaje: "Tus gastos están bajo control y tu ahorro se mantiene saludable. ¡Sigue así!",
            emoji: "✨"
        };
    });

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

    const totalIngresos = computed(() => historial.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresos = computed(() => historial.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));
    const saldo = computed(() => totalIngresos.value - totalEgresos.value);

    const totalIngresosFiltrados = computed(() => historialFiltrado.value.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0));
    const totalEgresosFiltrados = computed(() => historialFiltrado.value.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0));

    return {
        historial,
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