<!-- src/components/dashboard/NotificationBell.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabase'

const gestioLogo = new URL('@/assets/gestioIco.svg', import.meta.url).href

interface Notification {
  id: string
  title: string
  description: string
  time_ago?: string
  read?: boolean
  type?: string
}

const isOpen = ref(false)
const loading = ref(false)
const notifications = ref<Notification[]>([])

// Estados para el Modal de Soporte/Donación
const showSupportModal = ref(false)
const copiedField = ref<string | null>(null)

const supportData = {
  pagoMovil: {
    bank: 'Venezolano de Credito (0104)',
    phone: '0414-1235400',
    ci: 'V-31467533'
  },
  whatsapp: '+58-4141235400'
}

const copyText = (text: string, key: string) => {
  navigator.clipboard.writeText(text)
  copiedField.value = key
  setTimeout(() => {
    copiedField.value = null
  }, 2000)
}

// Clave única para guardar en el navegador las notificaciones que ya leíste
const LOCAL_STORAGE_READ_KEY = 'gestio_read_notifications'

// Obtiene los IDs leídos guardados localmente en este navegador
const getLocalReadIds = (): string[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_READ_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

// Guarda un ID como leído en el navegador
const saveLocalReadId = (id: string) => {
  try {
    const current = getLocalReadIds()
    if (!current.includes(id)) {
      current.push(id)
      localStorage.setItem(LOCAL_STORAGE_READ_KEY, JSON.stringify(current))
    }
  } catch (e) {
    console.error('Error al guardar en localStorage', e)
  }
}

// Computada estricta para el punto rojo
const unreadCount = computed(() => {
  return notifications.value.filter(n => n.read !== true).length
})

// Cargar notificaciones desde Supabase y cruzar con el respaldo local
const fetchNotifications = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (data) {
      const localReadIds = getLocalReadIds()
      notifications.value = data.map((item: any) => {
        // Si ya fue leída en Supabase O está guardada en el localStorage del navegador, pasa a true
        const isReadLocally = localReadIds.includes(item.id)
        return {
          ...item,
          read: item.read === true || isReadLocally,
          type: item.type ?? 'update',
          time_ago: item.time_ago ?? 'Hace un momento'
        }
      })
    }
  } catch (error) {
    console.error('Error al cargar las notificaciones desde Supabase:', error)
  } finally {
    loading.value = false
  }
}

// Marcar todas como leídas (Sincroniza Supabase y asegura respaldo local para evitar el F5)
const markAllAsRead = async () => {
  const unreadItems = notifications.value.filter(n => n.read !== true)
  if (unreadItems.length === 0) return

  // 1. Actualización inmediata en memoria y localStorage
  unreadItems.forEach(n => {
    n.read = true
    saveLocalReadId(n.id)
  })

  // 2. Intentar actualizar en Supabase en segundo plano
  try {
    const ids = unreadItems.map(n => n.id)
    const { error } = await supabase
      .from('app_notifications')
      .update({ read: true })
      .in('id', ids)

    if (error) {
      console.warn('Supabase bloqueó el UPDATE (revisa las políticas RLS de tu tabla):', error.message)
    }
  } catch (error) {
    console.error('Error al sincronizar lectura en Supabase:', error)
  }
}

const toggleView = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await fetchNotifications()
    await markAllAsRead()
  }
}

onMounted(() => {
  fetchNotifications()
})
</script>

<template>
  <div class="relative notifications-wrapper flex items-center">
    
    <!-- Botón de la campanita en el Header -->
    <button
      @click="toggleView"
      class="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer active:scale-95 border border-slate-200 shadow-2xs shrink-0"
      title="Notificaciones"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <!-- Indicador de no leídas -->
      <span v-if="unreadCount > 0" class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
    </button>

    <!-- PANTALLA COMPLETA / MODAL RESPONSIVO -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200"
    >
      <div class="bg-white w-full h-full md:h-[85vh] md:max-w-2xl md:rounded-2xl shadow-2xl border-0 md:border md:border-slate-200 flex flex-col overflow-hidden">
        
        <!-- Cabecera limpia -->
        <div class="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <button
            @click="isOpen = false"
            class="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
            title="Regresar"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div class="flex flex-col items-center text-center px-2">
            <h2 class="text-[11px] sm:text-sm font-black tracking-widest text-slate-900 uppercase">NOTIFICACIONES</h2>
          </div>

          <div class="w-9"></div>
        </div>

        <!-- Contenedor del listado -->
        <div class="flex-1 overflow-y-auto divide-y divide-slate-100 custom-scrollbar bg-slate-50/30">
          <div v-if="loading" class="flex items-center justify-center py-20 text-slate-400 text-xs font-medium">
            Cargando notificaciones...
          </div>

          <div v-else-if="notifications.length === 0" class="flex flex-col items-center justify-center py-24 px-4 text-center text-slate-400 text-xs font-medium space-y-2">
            <svg class="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span>No tienes notificaciones nuevas.</span>
          </div>

          <div
            v-for="item in notifications"
            :key="item.id"
            class="p-4 sm:p-5 flex gap-3.5 sm:gap-4 transition-colors bg-white hover:bg-slate-50/80"
          >
            <div class="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shrink-0 mt-0.5 text-slate-700">
              <svg v-if="item.type === 'update'" class="w-4 h-4 sm:w-5 sm:h-5 text-[#0b4d6c]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <h4 class="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">{{ item.title }}</h4>
              <p class="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{{ item.description }}</p>
              <span class="text-[11px] text-slate-400 font-medium mt-2 block">{{ item.time_ago }}</span>
            </div>
          </div>
        </div>

        <!-- BLOQUE FIJO INFERIOR (DONACIÓN) -->
        <div class="p-3.5 sm:p-4 bg-white border-t border-slate-100 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <img 
              :src="gestioLogo" 
              alt="Gestio Logo" 
              class="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 gestio-logo-color" 
            />
            <div class="min-w-0">
              <h4 class="text-xs sm:text-sm font-bold text-slate-900 truncate">Apoya el proyecto</h4>
              <p class="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">Ayúdanos a mantener Gestio activo.</p>
            </div>
          </div>
          <button
            @click="showSupportModal = true"
            class="w-full sm:w-auto px-4 py-2.5 bg-[#0b4d6c] hover:bg-[#093d56] text-white text-xs font-bold rounded-xl shadow-xs transition-all shrink-0 cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Donar</span>
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL DE SOPORTE / PAGO MÓVIL RESPONSIVO -->
    <div v-if="showSupportModal" class="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div class="bg-white text-slate-900 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-2xl border border-slate-100 flex flex-col animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <header class="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4 sm:mb-5">
          <h3 class="text-xs sm:text-base font-black text-slate-900 flex items-center gap-2.5 sm:gap-3.5 truncate">
            <img 
              :src="gestioLogo" 
              alt="Gestio Logo" 
              class="w-8 h-8 sm:w-11 sm:h-11 object-contain shrink-0 gestio-logo-color" 
            />
            <span class="truncate">Gestio - Soporte y Colaboración</span>
          </h3>
          <button @click="showSupportModal = false" class="text-slate-400 hover:text-slate-600 text-base font-bold cursor-pointer p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0">✕</button>
        </header>

        <div class="space-y-4 sm:space-y-5">
          <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Ayuda o colabora con <strong>DagStudio</strong> para seguir manteniendo y actualizando Gestio:
          </p>

          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2 shrink-0">
                <svg class="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Pago Móvil
              </span>
              <button 
                @click="copyText(`${supportData.pagoMovil.bank} - ${supportData.pagoMovil.phone} - ${supportData.pagoMovil.ci}`, 'pm')"
                class="text-[11px] sm:text-xs font-bold uppercase transition-colors cursor-pointer px-2.5 py-1 rounded-lg shrink-0"
                :class="copiedField === 'pm' ? 'text-[#0b4d6c] bg-[#0b4d6c]/15' : 'text-[#0b4d6c] hover:bg-[#0b4d6c]/10'"
              >
                {{ copiedField === 'pm' ? '✓ ¡Copiado!' : 'Copiar Datos' }}
              </button>
            </div>
            <div class="text-xs sm:text-sm text-slate-600 font-medium space-y-1.5 pt-2 border-t border-slate-200/60 overflow-x-auto">
              <p>Banco: <strong class="text-slate-900">{{ supportData.pagoMovil.bank }}</strong></p>
              <p>Teléfono: <strong class="text-slate-900">{{ supportData.pagoMovil.phone }}</strong></p>
              <p>C.I: <strong class="text-slate-900">{{ supportData.pagoMovil.ci }}</strong></p>
            </div>
          </div>

          <div class="p-4 bg-[#0b4d6c]/5 rounded-2xl border border-[#0b4d6c]/15 space-y-3">
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs sm:text-sm font-bold text-[#0b4d6c] flex items-center gap-2 shrink-0">
                <svg class="w-4 h-4 text-[#0b4d6c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Soporte y Dudas
              </span>
              <button 
                @click="copyText(supportData.whatsapp, 'wa')"
                class="text-[11px] sm:text-xs font-bold uppercase transition-colors cursor-pointer px-2.5 py-1 rounded-lg shrink-0"
                :class="copiedField === 'wa' ? 'text-[#0b4d6c] bg-[#0b4d6c]/15' : 'text-[#0b4d6c] hover:bg-[#0b4d6c]/10'"
              >
                {{ copiedField === 'wa' ? '✓ ¡Copiado!' : 'Copiar Número' }}
              </button>
            </div>
            <p class="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed break-words">
              Cualquier soporte, duda, etc. Escríbenos aquí: <strong class="text-slate-900">{{ supportData.whatsapp }}</strong>
            </p>
          </div>
        </div>

        <button 
          @click="showSupportModal = false"
          class="mt-5 sm:mt-6 w-full py-3 sm:py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
        >
          <span>¡Entendido, muchas gracias!</span>
        </button>
      </div>
    </div>

  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.gestio-logo-color {
  filter: brightness(0) saturate(100%) invert(20%) sepia(85%) saturate(1450%) hue-rotate(175deg) brightness(92%) contrast(98%);
}
</style>