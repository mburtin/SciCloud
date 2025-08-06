import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, ProfileUpdate, UserRole } from '@/types/supabase'
import { UserService } from '@/services/user.service'
import { useAuthStore } from './auth.store'

export const useUserStore = defineStore('user', () => {
  // Reactive state
  const users = ref<User[]>([])
  const currentUserProfile = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed properties
  const allUsers = computed(() => users.value.sort((a, b) => 
    new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime()
  ))

  const userCount = computed(() => users.value.length)

  const adminUsers = computed(() => 
    users.value.filter(user => user.role === 'admin')
  )

  const regularUsers = computed(() => 
    users.value.filter(user => user.role === 'user')
  )

  // Actions - all delegate to UserService
  
  // Get single user by ID
  async function getUser(userId: string): Promise<User | null> {
    try {
      loading.value = true
      error.value = null

      const user = await UserService.fetchUser(userId)
      
      if (user) {
        // Update cache if user exists
        const existingIndex = users.value.findIndex(u => u.id === userId)
        if (existingIndex >= 0) {
          users.value[existingIndex] = user
        } else {
          users.value.push(user)
        }
      }

      return user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }

  // Get all users
  async function getAllUsers(): Promise<User[]> {
    try {
      loading.value = true
      error.value = null

      const fetchedUsers = await UserService.fetchAllUsers()
      users.value = fetchedUsers

      return fetchedUsers
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users'
      error.value = errorMessage
      return []
    } finally {
      loading.value = false
    }
  }

  // Create new user
  async function createUser(userData: {
    email: string
    password: string
    first_name: string
    last_name: string
    biography?: string
    location?: string
    full_address?: string
    avatar_url?: string
    role?: UserRole
  }): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const result = await UserService.createUser(userData)

      if (result.success && result.data) {
        // Add to cache
        users.value.push(result.data)
      } else if (result.error) {
        error.value = result.error
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create user'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Update user profile (including role)
  async function updateProfile(userId: string, profileData: Partial<ProfileUpdate>): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const result = await UserService.updateProfile(userId, profileData)

      if (result.success && result.data) {
        // Update cache
        const existingIndex = users.value.findIndex(u => u.id === userId)
        if (existingIndex >= 0) {
          users.value[existingIndex] = result.data
        }

        // Update current user profile if it's the same user
        if (currentUserProfile.value?.id === userId) {
          currentUserProfile.value = result.data
        }
      } else if (result.error) {
        error.value = result.error
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Update current user's email
  async function updateEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const result = await UserService.updateEmail(newEmail)

      if (!result.success && result.error) {
        error.value = result.error
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update email'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Update current user's password
  async function updatePassword(currentPassword: string, newPassword: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const result = await UserService.updatePassword(currentPassword, newPassword, userEmail)

      if (!result.success && result.error) {
        error.value = result.error
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update password'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Delete user
  async function deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      loading.value = true
      error.value = null

      const result = await UserService.deleteUser(userId)

      if (result.success) {
        // Remove from cache
        users.value = users.value.filter(u => u.id !== userId)

        // Clear current user profile if it's the same user
        if (currentUserProfile.value?.id === userId) {
          currentUserProfile.value = null
        }
      } else if (result.error) {
        error.value = result.error
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  // Search user ID by email, name, etc.
  async function searchUserID(query: string): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      const userId = await UserService.searchUserID(query)

      return userId
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search user'
      error.value = errorMessage
      return null
    } finally {
      loading.value = false
    }
  }


  // Refresh cache
  async function refreshCache(): Promise<void> {
    await getAllUsers()
  }

  // Get current user profile (computed from auth state)
  function getCurrentUser(): User | null {
    return currentUserProfile.value
  }

  // Load current user profile based on auth state
  async function loadCurrentUserProfile(): Promise<void> {
    const authStore = useAuthStore()
    
    if (authStore.user?.id) {
      const profile = await getUser(authStore.user.id)
      if (profile) {
        currentUserProfile.value = profile
      }
    }
  }

  // Check if users exist (for bootstrap purposes)
  async function checkUsersExist(): Promise<boolean> {
    try {
      return await UserService.usersExist()
    } catch (err) {
      console.error('Error checking if users exist:', err)
      return false
    }
  }

  return {
    // State
    users: computed(() => users.value),
    currentUserProfile: computed(() => currentUserProfile.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // Computed
    allUsers,
    userCount,
    adminUsers,
    regularUsers,

    // Actions
    getUser,
    getAllUsers,
    createUser,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteUser,
    searchUserID,
    refreshCache,
    getCurrentUser,
    loadCurrentUserProfile,
    checkUsersExist
  }
})