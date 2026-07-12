<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useUiStore } from '../stores/uiStore';

ChartJS.register(ArcElement, Tooltip, Legend);

const uiStore = useUiStore();

const mapaColores = {
  'Hogar': '#f59e0b', 'Comida': '#10b981', 'Salida': '#f43f5e',
  'Ropa': '#8b5cf6', 'Transporte': '#f97316', 'Salud': '#ef4444',
  'Educación': '#0ea5e9', 'DagStudio': '#a855f7', 'Sueldo': '#3b82f6',
  'Trabajo': '#1d4ed8', 'Emprendimiento': '#3b82f6', 'Regalo': '#ec4899', 'Otros': '#64748b'
};

const chartData = computed(() => {
  const movimientos = uiStore.historialFiltrado;
  let labels = [];
  let data = [];
  let colors = [];

  // 1. Si hay una categoría específica seleccionada, mostramos un solo dato (o el desglose si hubiera varios movimientos)
  if (uiStore.filtroCategoria !== 'Todas') {
    const total = movimientos.reduce((sum, m) => sum + m.monto, 0);
    labels = [uiStore.filtroCategoria];
    data = [total];
    colors = [mapaColores[uiStore.filtroCategoria] || '#64748b'];
  }
  // 2. Si el filtro es por tipo (Ingreso/Egreso) pero categoría 'Todas'
  else if (uiStore.filtroTipo !== 'Todos') {
    const categorias = [...new Set(movimientos.map(m => m.categoria))];
    categorias.forEach(cat => {
      const montoCat = movimientos.filter(m => m.categoria === cat).reduce((sum, m) => sum + m.monto, 0);
      if (montoCat > 0) {
        labels.push(cat);
        data.push(montoCat);
        colors.push(mapaColores[cat] || '#64748b');
      }
    });
  }
  // 3. Si todo está en 'Todos', mostramos comparación global Ingreso vs Egreso
  else {
    const totalIng = movimientos.filter(m => m.tipo === 'Ingreso').reduce((sum, m) => sum + m.monto, 0);
    const totalEgr = movimientos.filter(m => m.tipo === 'Egreso').reduce((sum, m) => sum + m.monto, 0);

    if (totalIng > 0) { labels.push('Ingresos'); data.push(totalIng); colors.push('#0332fd'); }
    if (totalEgr > 0) { labels.push('Egresos'); data.push(totalEgr); colors.push('#ef4444'); }
  }

  return {
    datasets: [{ backgroundColor: colors, data, borderWidth: 0, hoverOffset: 10 }],
    labels
  };
});
</script>

<template>
  <div class="h-64 w-full flex justify-center items-center">
    <!-- El :key asegura que Vue destruya y cree la gráfica al cambiar los datos -->
    <Doughnut :key="JSON.stringify(chartData)" :data="chartData"
      :options="{ responsive: true, maintainAspectRatio: false }" />
  </div>
</template>