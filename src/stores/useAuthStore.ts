// src/stores/useAuthStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/supabase'

export interface User {
  id: string
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed<boolean>(() => user.value !== null)

  // Sincronizar usuario a partir de la sesión de Supabase
  const setUserFromSession = (sessionUser: any) => {
    if (!sessionUser) {
      user.value = null
      return
    }
    user.value = {
      id: sessionUser.id,
      username: sessionUser.user_metadata?.username || sessionUser.email?.split('@')[0] || 'Usuario',
      email: sessionUser.email || ''
    }
  }

  // Inicializar sesión actual al arrancar la aplicación
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      setUserFromSession(session?.user || null)

      // Escuchar cambios de estado en tiempo real (login, logout, token refresh)
      supabase.auth.onAuthStateChange((_event, session) => {
        setUserFromSession(session?.user || null)
      })
    } catch (error) {
      console.error('Error al inicializar la autenticación con Supabase:', error)
      user.value = null
    }
  }

  // Ejecutar inicialización de inmediato
  initAuth()

  const register = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ): Promise<void> => {
    const normalizedUsername = username.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedUsername || !normalizedEmail || !password || !confirmPassword) {
      throw new Error('Todos los campos son obligatorios.')
    }

    if (password !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden')
    }

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password: password,
      options: {
        data: {
          username: normalizedUsername
        }
      }
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      setUserFromSession(data.user)
    }
  }

  const login = async (emailOrUsername: string, password: string): Promise<void> => {
    const identifier = emailOrUsername.trim()

    if (!identifier || !password) {
      throw new Error('Por favor ingresa tu usuario/correo y contraseña.')
    }

    // Soporte para autenticar tanto por email directo como si ingresaron el username (si el backend lo requiere o mapeando)
    let emailToSign = identifier
    if (!identifier.includes('@')) {
      // Si el usuario ingresó un username en lugar de email, puedes manejarlo aquí o requerir email directamente.
      // Supabase Auth por defecto usa email. Asumiremos email o validaremos.
      throw new Error('Por favor ingresa tu correo electrónico registrado para iniciar sesión.')
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailToSign.toLowerCase(),
      password: password
    })

    if (error) {
      throw new Error('Credenciales inválidas o contraseña incorrecta.')
    }

    if (data.user) {
      setUserFromSession(data.user)
    }
  }

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error al cerrar sesión:', error.message)
    }
    user.value = null
  }

  const updateUser = async (updatedData: { username?: string; email?: string; password?: string }): Promise<void> => {
    if (!user.value) {
      throw new Error('No hay una sesión activa para actualizar.')
    }

    const updatePayload: { email?: string; password?: string; data?: { username?: string } } = {}

    if (updatedData.email !== undefined) {
      updatePayload.email = updatedData.email.trim().toLowerCase()
    }

    if (updatedData.password !== undefined && updatedData.password.trim() !== '') {
      updatePayload.password = updatedData.password
    }

    if (updatedData.username !== undefined) {
      updatePayload.data = { username: updatedData.username.trim() }
    }

    const { data, error } = await supabase.auth.updateUser(updatePayload)

    if (error) {
      throw new Error(error.message)
    }

    if (data.user) {
      setUserFromSession(data.user)
    }
  }

  return {
    user,
    isAuthenticated,
    register,
    login,
    logout,
    updateUser
  }
})