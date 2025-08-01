/**
 * User service - Handles user data operations
 * Now using Supabase for real data operations
 */

import { ProfileService } from './profile.service'
import { mockNotificationSettings } from '@/mocks/notification-settings.mock'
import { requireAuth, createAuthResult } from '@/utils/auth.utils'
import type { User } from '@/types/supabase'
import type { NotificationSettings } from '@/types/notifications'

export class UserService {
  /**
   * Get current user profile (unified method)
   * Returns full profile or basic info subset
   */
  async getUserProfile(): Promise<User | null> {
    try {
      const user = await requireAuth()
      return await ProfileService.getProfile(user.id)
    } catch {
      return null
    }
  }

  /**
   * Get current user basic info (for header, etc.)
   * Legacy method - now uses getUserProfile internally
   */
  async getCurrentUser(): Promise<Pick<User, 'firstName' | 'lastName' | 'email'> & { avatar_url?: string }> {
    const profile = await this.getUserProfile()
    
    if (!profile) {
      throw new Error('Profile not found')
    }

    return {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email || '',
      avatar_url: profile.avatar_url || undefined
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const user = await requireAuth()
      return await ProfileService.updateProfile(user.id, updates)
    } catch (_error) {
      const errorMessage = _error instanceof Error ? _error.message : 'Unknown error'
      return createAuthResult(undefined, errorMessage)
    }
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings() {
    // TODO: Replace with Supabase call
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('notification_settings')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockNotificationSettings
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: NotificationSettings) {
    // TODO: Replace with Supabase call
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('notification_settings')
    //   .upsert({ ...settings, user_id: user.id })
    //   .select()
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 150))
    return { ...mockNotificationSettings, ...settings }
  }
}

export const userService = new UserService()