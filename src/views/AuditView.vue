<!-- src/views/AuditView.vue -->
<script setup lang="ts">
import AuditHeader from '@/components/audit/AuditHeader.vue'
import AuditKpiCards from '@/components/audit/AuditKpiCards.vue'
import AuditChartSection from '@/components/audit/AuditChartSection.vue'
import AuditProjectionsCard from '@/components/audit/AuditProjectionsCard.vue'
import AuditTransactionTable from '@/components/audit/AuditTransactionTable.vue'
</script>

<template>
  <div class="flex-1 flex flex-col h-full overflow-hidden bg-slate-100">
    <!-- Cabecera Institucional -->
    <AuditHeader />

    <!-- Contenido Scrollable -->
    <main class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
      <!-- KPIs Superiores -->
      <AuditKpiCards />

      <!-- Gráfica Analítica e Interactiva -->
      <AuditChartSection />

      <!-- Tarjeta de Proyecciones -->
      <AuditProjectionsCard />

      <!-- Tabla Maestra y Exportación -->
      <AuditTransactionTable />
    </main>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>