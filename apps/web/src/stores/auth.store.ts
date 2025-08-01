import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/supabase'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth'
import * as authService from '@/services/auth.service'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  // Simplified reactive state - following modern Supabase patterns
  const session = ref<Session | null>(null)
  const user = ref<SupabaseUser | null>(null)  // Use Supabase's native User type for auth
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  
  // Auth state change listener cleanup
  let authUnsubscribe: (() => void) | null = null

  // Computed
  const isAuthenticated = computed(() => !!session.value?.user)

  // Simplified initialization following modern Supabase patterns
  async function initialize() {
    if (isInitialized.value) {
      return
    }
    
    try {
      loading.value = true
      error.value = null
      
      // Get current session using simplified auth service
      const result = await authService.getCurrentSession()
      if (result.success) {
        session.value = result.data?.session || null
        user.value = result.data?.session?.user || null
      }

      // Set up auth state change listener
      setupAuthStateListener()
      isInitialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Auth initialization failed'
    } finally {
      loading.value = false
    }
  }

  // Simplified auth state listener using Supabase's native patterns
  function setupAuthStateListener() {
    if (authUnsubscribe) {
      authUnsubscribe()
    }
    
    // Use simplified auth service listener
    authUnsubscribe = authService.onAuthStateChange((event, newSession) => {
      
      // Update state directly from Supabase events - single source of truth
      session.value = newSession
      user.value = newSession?.user || null
    })
  }


  // Simplified login - let auth state listener handle updates
  async function login(credentials: LoginCredentials) {
    try {
      loading.value = true
      error.value = null
      
      const result = await authService.signInWithPassword(credentials)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Auth state listener will automatically update session/user state
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Register new user
  async function register(credentials: RegisterCredentials) {
    try {
      loading.value = true
      
      const result = await authService.signUpWithPassword(credentials)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      return { success: true, data: result.data }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Simplified logout - let auth state listener handle state clearing
  async function logout() {
    try {
      loading.value = true
      
      const result = await authService.signOut()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sign out')
      }
      
      // Auth state listener will automatically clear session/user state
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }
  
  // Logout from all sessions
  async function logoutEverywhere() {
    try {
      loading.value = true
      
      const result = await authService.signOutEverywhere()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to sign out from all sessions')
      }
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Global logout failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Update user profile (needs proper User type conversion)
  async function updateProfile(updates: Partial<User>) {
    if (!user.value) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      // Note: This will need to be updated when profile management is implemented
      // For now, just use the user ID from Supabase auth
      const result = await authService.updateUserProfile(user.value.id, updates)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      return { success: true, data: result.data }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    }
  }
  
  // Cleanup on store disposal
  function dispose() {
    if (authUnsubscribe) {
      authUnsubscribe()
      authUnsubscribe = null
    }
  }

  return { 
    // State
    session: computed(() => session.value),
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Computed
    isAuthenticated,
    isInitialized: computed(() => isInitialized.value),
    
    // Actions
    initialize,
    login, 
    register,
    logout,
    logoutEverywhere,
    updateProfile,
    dispose
  }
})
