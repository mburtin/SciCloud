/**
 * User service - Handles user data operations
 * Currently using mock data, will be replaced with Supabase calls
 */

import { mockUser } from '@/mocks/user.mock'
import { mockUserProfile } from '@/mocks/profile.mock'
import { mockActiveSessions } from '@/mocks/security.mock'
import { mockNotificationSettings } from '@/mocks/notification-settings.mock'
import type { User } from '@/types/user'
import type { Session } from '@/types/auth'

export class UserService {
  /**
   * Get current user basic info (for header, etc.)
   */
  async getCurrentUser(): Promise<Pick<User, 'firstName' | 'lastName' | 'email'> & { avatar_url?: string }> {
    // TODO: Replace with Supabase call
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('users')
    //   .select('firstName, lastName, email, avatar_url')
    //   .eq('id', user.id)
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      firstName: 'Dr. Evelyn',
      lastName: 'Reed',
      email: mockUser.email,
      avatar_url: mockUser.avatar
    }
  }

  /**
   * Get full user profile
   */
  async getUserProfile(): Promise<User> {
    // TODO: Replace with Supabase call
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('users')
    //   .select('*')
    //   .eq('id', user.id)
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 150))
    return mockUserProfile
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: Partial<User>): Promise<User> {
    // TODO: Replace with Supabase call
    // const { data: { user } } = await supabase.auth.getUser()
    // const { data, error } = await supabase
    //   .from('users')
    //   .update({ ...updates, updated_at: new Date().toISOString() })
    //   .eq('id', user.id)
    //   .select()
    //   .single()
    await new Promise(resolve => setTimeout(resolve, 200))
    
    return { ...mockUserProfile, ...updates, updated_at: new Date().toISOString() }
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
  async updateNotificationSettings(settings: any) {
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