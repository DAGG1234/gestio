// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { supabase } from '@/supabase'
import AppLayout from '@/layouts/AppLayout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { requiresAuth: false }
  },
  // Shell de Navegación Principal (Layout Anidado)
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: { name: 'dashboard' }
      },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'audit',
        name: 'audit',
        component: () => import('@/views/AuditView.vue')
      },
      {
        path: 'savings',
        name: 'savings',
        component: () => import('@/views/SavingsView.vue')
      },
      {
        path: 'debts',
        name: 'debts',
        component: () => import('@/views/DebtsView.vue')
      },
      {
        path: 'financial-health',
        name: 'financial-health',
        component: () => import('@/views/FinancialHealthView.vue')
      },
      {
        path: 'exchange',
        name: 'exchange',
        component: () => import('@/views/ExchangeView.vue')
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue')
      }
    ]
  },
  // Redirección de seguridad para rutas no encontradas (404)
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation Guard global para control de autenticación con Supabase
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()

  // Si el store aún no tiene usuario, verificamos directamente la sesión activa en Supabase
  // para evitar falsos positivos al recargar la página (F5).
  let isAuthenticated = authStore.isAuthenticated

  if (!isAuthenticated) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      isAuthenticated = !!session?.user
    } catch (error) {
      console.error('Error al verificar la sesión en el guard de navegación:', error)
      isAuthenticated = false
    }
  }

  // Si la ruta requiere autenticación y el usuario no está autenticado, redirigir al login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'login' })
  }

  // Si el usuario ya está autenticado e intenta acceder a login o register, redirigir al dashboard
  if (!to.meta.requiresAuth && isAuthenticated && (to.name === 'login' || to.name === 'register')) {
    return next({ name: 'dashboard' })
  }

  next()
})

export default router