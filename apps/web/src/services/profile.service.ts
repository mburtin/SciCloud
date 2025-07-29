/**
 * Profile service for managing user profiles with Supabase
 */
import { supabase } from '@/lib/supabase'
import type { User } from '@/types/user'
import type { Database } from '@/types/supabase'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class ProfileService {
  /**
   * Get user profile by ID
   */
  static async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return this.mapProfileToUser(data)
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  }

  /**
   * Get all profiles (for team collaboration)
   */
  static async getAllProfiles(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching profiles:', error)
        return []
      }

      return data.map(profile => this.mapProfileToUser(profile))
    } catch (error) {
      console.error('Error in getAllProfiles:', error)
      return []
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<User>): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const profileUpdate: ProfileUpdate = {
        first_name: updates.firstName,
        last_name: updates.lastName,
        biography: updates.biography,
        phone: updates.phone,
        location: updates.location,
        full_address: updates.fullAddress,
        avatar_url: updates.avatar_url,
        role: updates.role,
        updated_by: userId,
        updated_at: new Date().toISOString()
      }

      // Remove undefined values
      Object.keys(profileUpdate).forEach(key => {
        if (profileUpdate[key as keyof ProfileUpdate] === undefined) {
          delete profileUpdate[key as keyof ProfileUpdate]
        }
      })

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
      }

      return { 
        success: true, 
        data: this.mapProfileToUser(data)
      }
    } catch (error: any) {
      console.error('Error in updateProfile:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Error deleting profile:', error)
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error in deleteProfile:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Upload avatar image
   */
  static async uploadAvatar(userId: string, file: File): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random()}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        return { success: false, error: uploadError.message }
      }

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // Update profile with new avatar URL
      const updateResult = await this.updateProfile(userId, { avatar_url: data.publicUrl })
      
      if (!updateResult.success) {
        return { success: false, error: updateResult.error }
      }

      return { success: true, url: data.publicUrl }
    } catch (error: any) {
      console.error('Error in uploadAvatar:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Search profiles by name or email
   */
  static async searchProfiles(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching profiles:', error)
        return []
      }

      return data.map(profile => this.mapProfileToUser(profile))
    } catch (error) {
      console.error('Error in searchProfiles:', error)
      return []
    }
  }

  /**
   * Get profiles by role
   */
  static async getProfilesByRole(role: 'admin' | 'user' | 'viewer'): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', role)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching profiles by role:', error)
        return []
      }

      return data.map(profile => this.mapProfileToUser(profile))
    } catch (error) {
      console.error('Error in getProfilesByRole:', error)
      return []
    }
  }

  /**
   * Map database profile to User interface
   */
  private static mapProfileToUser(profile: ProfileRow): User {
    return {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: '', // Email comes from auth.users, will be set by the auth store
      role: profile.role as 'admin' | 'user' | 'viewer',
      avatar_url: profile.avatar_url || undefined,
      biography: profile.biography,
      phone: profile.phone,
      location: profile.location,
      fullAddress: profile.full_address,
      created_by: profile.created_by || '',
      created_at: profile.created_at,
      updated_by: profile.updated_by || '',
      updated_at: profile.updated_at,
      version: profile.version,
      stats: [] // TODO: Calculate stats from other tables later
    }
  }
}