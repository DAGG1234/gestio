<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useUiStore } from '../stores/uiStore';
import { useMovimientosStore } from '../stores/movimientosStore';

const props = defineProps({
  modo: {
    type: String,
    default: 'detalle'
  }
});

ChartJS.register(ArcElement, Tooltip, Legend);

const uiStore = useUiStore();
const movStore = useMovimientosStore();

const mapaColores = {
  'Hogar': '#f59e0b', 'Comida': '#10b981', 'Salida': '#f43f5e',
  'Ropa': '#8b5cf6', 'Transporte': '#f97316', 'Salud': '#ef4444',
  'Educación': '#0ea5e9', 'DagStudio': '#a855f7', 'Sueldo': '#3b82f6',
  'Trabajo': '#1d4ed8', 'Emprendimiento': '#3b82f6', 'Regalo': '#ec4899', 'Otros': '#64748b'
};

const chartData = computed(() => {
  // 1. Obtenemos el historial completo
  let movimientos = props.modo === 'resumen' ? movStore.historial : movStore.historialFiltrado;

  // 2. Si es detalle, aplicamos el filtro de tipo (Ingreso/Egreso) si no es 'Todos'
  // IMPORTANTE: Esto asegura que si elegiste 'Ingreso', solo trabajamos con ingresos.
  if (props.modo === 'detalle' && uiStore.filtroTipo !== 'Todos') {
    movimientos = movimientos.filter(m => m.tipo === uiStore.filtroTipo);
  }

  // 3. Aplicamos el filtro de categoría específica si existe
  if (props.modo === 'detalle' && uiStore.filtroCategoria !== 'Todas') {
    movimientos = movimientos.filter(m => m.categoria === uiStore.filtroCategoria);
  }

  // 4. Agrupamos por categoría
  const categoriasUnicas = [...new Set(movimientos.map(m => m.categoria))];

  const labels = [];
  const data = [];
  const colors = [];

  categoriasUnicas.forEach(cat => {
    const totalCat = movimientos
      .filter(m => m.categoria === cat)
      .reduce((sum, m) => sum + m.monto, 0);

    if (totalCat > 0) {
      labels.push(cat);
      data.push(totalCat);
      colors.push(mapaColores[cat] || '#64748b');
    }
  });

  return {
    datasets: [{ backgroundColor: colors, data, borderWidth: 0, hoverOffset: 10 }],
    labels
  };
});
</script>

<template>
  <div class="h-64 w-full flex justify-center items-center">
    <Doughnut :key="JSON.stringify(chartData)" :data="chartData" :options="{
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'bottom', labels: { usePointStyle: true } }
      }
    }" />
  </div>
</template>