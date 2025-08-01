/**
 * User composable - Manages user data and profile state
 */

import { ref, computed } from 'vue'
import { userService } from '@/services/user.service'
import type { User } from '@/types/supabase'
import type { NotificationSettings } from '@/types/notifications'

export function useUser() {
  // State
  const currentUser = ref<(Pick<User, 'firstName' | 'lastName' | 'email'> & { avatar_url?: string }) | null>(null)
  const userProfile = ref<User | null>(null)
  const notificationSettings = ref<NotificationSettings | null>(null)
  const isLoading = ref(false)
  const isLoadingProfile = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const userDisplayName = computed(() => {
    if (!currentUser.value) return ''
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`.trim()
  })

  const userInitials = computed(() => {
    if (!currentUser.value) return ''
    const firstName = currentUser.value.firstName || ''
    const lastName = currentUser.value.lastName || ''
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  })


  // Methods
  const fetchCurrentUser = async () => {
    if (isLoading.value) return

    isLoading.value = true
    error.value = null

    try {
      const user = await userService.getCurrentUser()
      currentUser.value = user
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user data'
    } finally {
      isLoading.value = false
    }
  }

  const fetchUserProfile = async () => {
    isLoadingProfile.value = true
    error.value = null

    try {
      const profile = await userService.getUserProfile()
      userProfile.value = profile
      return profile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load user profile'
      return null
    } finally {
      isLoadingProfile.value = false
    }
  }

  const updateProfile = async (updates: Partial<User>) => {
    try {
      const result = await userService.updateProfile(updates)
      if (!result.success) {
        throw new Error(result.error || 'Failed to update profile')
      }
      
      const updatedProfile = result.data!
      userProfile.value = updatedProfile
      
      // Update current user if basic info changed
      if (updates.firstName || updates.lastName || updates.email) {
        if (currentUser.value) {
          currentUser.value = {
            ...currentUser.value,
            firstName: updatedProfile.firstName,
            lastName: updatedProfile.lastName,
            email: updatedProfile.email
          }
        }
      }
      
      return updatedProfile
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    }
  }


  const fetchNotificationSettings = async () => {
    try {
      const settings = await userService.getNotificationSettings()
      notificationSettings.value = settings
      return settings
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load notification settings'
      return null
    }
  }

  const updateNotificationSettings = async (settings: NotificationSettings) => {
    try {
      const updatedSettings = await userService.updateNotificationSettings(settings)
      notificationSettings.value = updatedSettings
      return updatedSettings
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update notification settings'
      throw err
    }
  }

  return {
    // State
    currentUser,
    userProfile,
    notificationSettings,
    isLoading,
    isLoadingProfile,
    error,

    // Computed
    userDisplayName,
    userInitials,

    // Methods
    fetchCurrentUser,
    fetchUserProfile,
    updateProfile,
    fetchNotificationSettings,
    updateNotificationSettings
  }
}