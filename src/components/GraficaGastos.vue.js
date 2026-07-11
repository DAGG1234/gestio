import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useGestioStore } from '../stores/gestioStore';
ChartJS.register(ArcElement, Tooltip, Legend);
const store = useGestioStore();
// Añadimos el prop "modo" para controlar su comportamiento
const props = defineProps({ modo: { type: String, default: 'detalle' } });
const mapaColores = {
    'Hogar': '#f59e0b', 'Comida': '#10b981', 'Salida': '#f43f5e',
    'Ropa': '#8b5cf6', 'Transporte': '#f97316', 'Salud': '#ef4444',
    'Educación': '#0ea5e9', 'Otros': '#64748b'
};
const chartData = computed(() => {
    // MODO RESUMEN (Para el Panel Principal)
    // Ignora filtros y muestra Ingreso Total vs Egreso Total
    if (props.modo === 'resumen') {
        return {
            labels: ['Ingresos', 'Egresos'],
            datasets: [{
                    backgroundColor: ['#0332fd', '#ef4444'], // Azul y Rojo
                    data: [store.totalIngresos, store.totalEgresos] // Usamos totales generales
                }]
        };
    }
    // MODO DETALLE (Para el Historial)
    // Usa los filtros del store
    const totalIngreso = store.totalIngresosFiltrados;
    const esFiltroGeneral = store.filtroCategoria === 'Todas' || !store.filtroCategoria;
    let labels = ['Ingresos'];
    let data = [totalIngreso];
    let colors = ['#0332fd'];
    if (esFiltroGeneral) {
        Object.keys(mapaColores).forEach(cat => {
            const montoCat = store.historialFiltrado
                .filter(m => m.categoria === cat && m.tipo === 'Egreso')
                .reduce((sum, m) => sum + m.monto, 0);
            if (montoCat > 0) {
                labels.push(cat);
                data.push(montoCat);
                colors.push(mapaColores[cat]);
            }
        });
    }
    else {
        const montoFiltro = store.totalEgresosFiltrados;
        if (montoFiltro > 0) {
            labels.push(store.filtroCategoria);
            data.push(montoFiltro);
            colors.push(mapaColores[store.filtroCategoria] || '#ef4444');
        }
    }
    return { datasets: [{ backgroundColor: colors, data, borderWidth: 0, hoverOffset: 10 }], labels };
});
debugger; /* PartiallyEnd: #3632/scriptSetup.vue */
const __VLS_ctx = {};
let __VLS_components;
let __VLS_directives;
__VLS_asFunctionalElement(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
    ...{ class: "h-64 w-full flex justify-center items-center" },
});
const __VLS_0 = {}.Doughnut;
/** @type {[typeof __VLS_components.Doughnut, ]} */ ;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
    key: (JSON.stringify(__VLS_ctx.chartData)),
    data: (__VLS_ctx.chartData),
    options: ({ responsive: true, maintainAspectRatio: false }),
}));
const __VLS_2 = __VLS_1({
    key: (JSON.stringify(__VLS_ctx.chartData)),
    data: (__VLS_ctx.chartData),
    options: ({ responsive: true, maintainAspectRatio: false }),
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
/** @type {__VLS_StyleScopedClasses['h-64']} */ ;
/** @type {__VLS_StyleScopedClasses['w-full']} */ ;
/** @type {__VLS_StyleScopedClasses['flex']} */ ;
/** @type {__VLS_StyleScopedClasses['justify-center']} */ ;
/** @type {__VLS_StyleScopedClasses['items-center']} */ ;
var __VLS_dollars;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
            Doughnut: Doughnut,
            chartData: chartData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {
            $props: __VLS_makeOptional(props),
            ...props,
        };
    },
});
; /* PartiallyEnd: #4569/main.vue */
