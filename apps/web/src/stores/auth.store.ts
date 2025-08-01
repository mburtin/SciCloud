import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/supabase'
import type { LoginCredentials, RegisterCredentials, Session, AuthEvent } from '@/types/auth'
import { supabase } from '@/lib/supabase'
import { sessionService } from '@/services/session.service'

export const useAuthStore = defineStore('auth', () => {
  // Modern session state
  const currentSession = ref<Session>({
    isAuthenticated: false,
    user: null,
    lastActive: 0,
    isInitialized: false
  })
  
  const loading = ref(true)
  const error = ref<string | null>(null)
  
  // Auth state change listener cleanup
  let authUnsubscribe: (() => void) | null = null

  // Computed
  const isAuthenticated = computed(() => currentSession.value.isAuthenticated)
  const user = computed(() => currentSession.value.user)
  const isInitialized = computed(() => currentSession.value.isInitialized)

  // Initialize auth state with modern session management
  async function initialize() {
    if (currentSession.value.isInitialized) {
      return // Already initialized
    }
    
    try {
      loading.value = true
      error.value = null
      
      // Get current session - Supabase 2025 security standard
      const sessionInfo = await sessionService.getCurrentSession()
      
      if (sessionInfo?.isValid) {
        currentSession.value.user = sessionInfo.user
        currentSession.value.isAuthenticated = true
        currentSession.value.lastActive = Date.now()
      } else {
        currentSession.value.user = null
        currentSession.value.isAuthenticated = false
      }

      // Set up modern auth state change handling
      setupAuthStateListener()
      currentSession.value.isInitialized = true
    } catch (err) {
      console.error('Error initializing auth:', err)
      error.value = err instanceof Error ? err.message : 'Auth initialization failed'
      currentSession.value.isAuthenticated = false
    } finally {
      loading.value = false
    }
  }

  // Set up modern auth state change listener
  function setupAuthStateListener() {
    // Clean up existing listener
    if (authUnsubscribe) {
      authUnsubscribe()
    }
    
    // Set up new listener with session service
    authUnsubscribe = sessionService.onAuthStateChange(async (event: AuthEvent) => {
      console.log('Auth event received:', event.type)
      
      switch (event.type) {
        case 'SIGNED_IN':
          if (event.user) {
            currentSession.value.user = event.user
            currentSession.value.isAuthenticated = true
            currentSession.value.lastActive = Date.now()
          }
          break
          
        case 'SIGNED_OUT':
          currentSession.value.user = null
          currentSession.value.isAuthenticated = false
          currentSession.value.lastActive = 0
          break
          
        case 'TOKEN_REFRESHED':
          if (event.user) {
            currentSession.value.user = event.user
            currentSession.value.lastActive = Date.now()
          }
          break
          
        case 'USER_UPDATED':
          if (event.user) {
            currentSession.value.user = event.user
          }
          break
          
        case 'SESSION_EXPIRED':
        default: {
          // Handle session expiry or unknown events
          const sessionInfo = await sessionService.getCurrentSession()
          if (sessionInfo?.isValid) {
            currentSession.value.user = sessionInfo.user
            currentSession.value.isAuthenticated = true
            currentSession.value.lastActive = Date.now()
          } else {
            currentSession.value.user = null
            currentSession.value.isAuthenticated = false
          }
          break
        }
      }
    })
  }


  // Login with email and password
  async function login(credentials: LoginCredentials) {
    try {
      loading.value = true
      error.value = null
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        throw authError
      }

      if (data.user) {
        // Session state will be updated via auth state change listener
        // Just ensure we have the latest session info
        const sessionInfo = await sessionService.getCurrentSession()
        if (sessionInfo?.isValid) {
          currentSession.value.user = sessionInfo.user
          currentSession.value.isAuthenticated = true
          currentSession.value.lastActive = Date.now()
        }
      }

      return { success: true }
    } catch (err: any) {
      console.error('Login error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Register new user
  async function register(credentials: RegisterCredentials) {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            first_name: credentials.firstName,
            last_name: credentials.lastName
          }
        }
      })

      if (error) {
        throw error
      }

      return { success: true, data }
    } catch (error: any) {
      console.error('Register error:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // Logout with modern session management
  async function logout() {
    try {
      loading.value = true
      
      // Use session service for proper cleanup
      const success = await sessionService.signOut()
      
      if (!success) {
        throw new Error('Failed to sign out')
      }
      
      // State will be cleared via auth state change listener
      return { success: true }
    } catch (err: any) {
      console.error('Logout error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }
  
  // Logout from all sessions
  async function logoutEverywhere() {
    try {
      loading.value = true
      
      const success = await sessionService.signOutEverywhere()
      
      if (!success) {
        throw new Error('Failed to sign out from all sessions')
      }
      
      return { success: true }
    } catch (err: any) {
      console.error('Global logout error:', err)
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  // Update user profile
  async function updateProfile(updates: Partial<User>) {
    if (!currentSession.value.user) {
      return { success: false, error: 'Not authenticated' }
    }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          biography: updates.biography,
          location: updates.location,
          full_address: updates.fullAddress,
          avatar_url: updates.avatar_url,
        })
        .eq('id', currentSession.value.user.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      
      return { success: true, data }
    } catch (err: any) {
      console.error('Update profile error:', err)
      error.value = err.message
      return { success: false, error: err.message }
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
    user,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    
    // Computed
    isAuthenticated,
    isInitialized,
    
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
