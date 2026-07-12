import { createRouter, createWebHistory } from 'vue-router';
import PanelPrincipal from '../views/Cl_vPanelPrincipal.vue'; // Corregido con V mayúscula
import HistorialCompleto from '../views/HistorialCompleto.vue';
import Configuracion from '../views/Configuracion.vue'; // Corregido con V mayúscula

const routes = [
  { path: '/', name: 'Dashboard', component: PanelPrincipal },
  { path: '/auditoria', name: 'Auditoria', component: HistorialCompleto },
  { path: '/configuracion', name: 'Configuracion', component: Configuracion }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 