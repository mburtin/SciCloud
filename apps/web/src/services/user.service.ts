/**
 * User service - Handles user data operations
 * Now using Supabase for real data operations
 */

import { supabase } from '@/lib/supabase'
import { ProfileService } from './profile.service'
import { mockActiveSessions } from '@/mocks/security.mock'
import { mockNotificationSettings } from '@/mocks/notification-settings.mock'
import type { User } from '@/types/user'
import type { Session } from '@/types/auth'
import type { NotificationSettings } from '@/types/notifications'

export class UserService {
  /**
   * Get current user basic info (for header, etc.)
   */
  async getCurrentUser(): Promise<Pick<User, 'firstName' | 'lastName' | 'email'> & { avatar_url?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('No authenticated user')
      }

      const profile = await ProfileService.getProfile(user.id)
      
      if (!profile) {
        throw new Error('Profile not found')
      }

      return {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: user.email || '',
        avatar_url: profile.avatar_url
      }
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  }

  /**
   * Get full user profile
   */
  async getUserProfile(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return null
      }

      const profile = await ProfileService.getProfile(user.id)
      
      if (profile) {
        // Add email from auth.users
        profile.email = user.email || ''
      }

      return profile
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        return { success: false, error: 'No authenticated user' }
      }

      const result = await ProfileService.updateProfile(user.id, updates)
      
      if (result.success && result.data) {
        // Add email from auth.users
        result.data.email = user.email || ''
      }

      return result
    } catch (error: any) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get user sessions
   */
  async getUserSessions(): Promise<Session[]> {
    // TODO: Replace with Supabase call
    // const { data, error } = await supabase
    //   .from('user_sessions')
    //   .select('*')
    //   .order('lastActive', { ascending: false })
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockActiveSessions
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