import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import type { User } from '@/types/supabase'
import type { LoginCredentials, RegisterCredentials } from '@/types/auth'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<SupabaseUser | null>(null)
  const profile = ref<User | null>(null)
  const loading = ref(true)

  // Computed
  const isAuthenticated = computed(() => !!user.value)
  const isLoggedIn = computed(() => isAuthenticated.value)

  // Initialize auth state
  async function initialize() {
    try {
      loading.value = true
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        user.value = session.user
        await fetchProfile()
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (_, session) => {
        if (session?.user) {
          user.value = session.user
          await fetchProfile()
        } else {
          user.value = null
          profile.value = null
        }
      })
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      loading.value = false
    }
  }

  // Fetch user profile
  async function fetchProfile() {
    if (!user.value) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        profile.value = {
          ...data,
          email: user.value.email || '',
          firstName: data.first_name,
          lastName: data.last_name,
          fullAddress: data.full_address,
          stats: [] // TODO: Calculate stats from other tables later
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  // Login with email and password
  async function login(credentials: LoginCredentials) {
    try {
      loading.value = true
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        throw error
      }

      if (data.user) {
        user.value = data.user
        await fetchProfile()
      }

      return { success: true }
    } catch (error: any) {
      console.error('Login error:', error)
      return { success: false, error: error.message }
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

  // Logout
  async function logout() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      
      user.value = null
      profile.value = null
      
      return { success: true }
    } catch (error: any) {
      console.error('Logout error:', error)
      return { success: false, error: error.message }
    }
  }

  // Update user profile
  async function updateProfile(updates: Partial<User>) {
    if (!user.value || !profile.value) return { success: false, error: 'Not authenticated' }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.firstName,
          last_name: updates.lastName,
          biography: updates.biography,
          location: updates.location,
          full_address: updates.fullAddress,
          avatar_url: updates.avatar_url,
        })
        .eq('id', user.value.id)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Refresh profile
      await fetchProfile()
      
      return { success: true, data }
    } catch (error: any) {
      console.error('Update profile error:', error)
      return { success: false, error: error.message }
    }
  }

  return { 
    // State
    user: computed(() => user.value),
    profile: computed(() => profile.value),
    loading: computed(() => loading.value),
    
    // Computed
    isAuthenticated,
    isLoggedIn,
    
    // Actions
    initialize,
    fetchProfile,
    login, 
    register,
    logout,
    updateProfile
  }
})
