/**
 * Profile service for managing user profiles with Supabase
 */
import { supabase } from '@/lib/supabase'
import type { Database, User, UserUpdate, UserProfileView } from '@/types/supabase'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export class ProfileService {
  /**
   * Get user profile by ID using profiles table and auth data
   */
  static async getProfile(userId: string): Promise<User | null> {
    try {
      // Get auth user data
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('Error getting auth user:', authError)
        return null
      }

      // Get profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        return null
      }

      return this.mapProfileToUser(profile, user)
    } catch (error) {
      console.error('Error in getProfile:', error)
      return null
    }
  }

  /**
   * Get all profiles (for team collaboration) using combined view
   */
  static async getAllProfiles(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching user profiles:', error)
        return []
      }

      return data.map(profile => this.mapViewToUser(profile))
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
      const profileUpdate: UserUpdate = {
        first_name: updates.firstName,
        last_name: updates.lastName,
        biography: updates.biography,
        location: updates.location,
        full_address: updates.fullAddress,
        avatar_url: updates.avatar_url,
        role: updates.role,
      }

      // Remove undefined values
      Object.keys(profileUpdate).forEach(key => {
        if (profileUpdate[key as keyof UserUpdate] === undefined) {
          delete profileUpdate[key as keyof UserUpdate]
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

      // Get updated profile using the combined view
      const updatedProfile = await this.getProfile(userId)
      if (!updatedProfile) {
        return { success: false, error: 'Failed to retrieve updated profile' }
      }
      
      return { 
        success: true, 
        data: updatedProfile
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
   * Search profiles by name or email using combined view
   */
  static async searchProfiles(query: string): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error searching user profiles:', error)
        return []
      }

      return data.map(profile => this.mapViewToUser(profile))
    } catch (error) {
      console.error('Error in searchProfiles:', error)
      return []
    }
  }

  /**
   * Get profiles by role using combined view
   */
  static async getProfilesByRole(role: 'admin' | 'user' | 'viewer'): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('role', role)
        .order('first_name', { ascending: true })

      if (error) {
        console.error('Error fetching user profiles by role:', error)
        return []
      }

      return data.map(profile => this.mapViewToUser(profile))
    } catch (error) {
      console.error('Error in getProfilesByRole:', error)
      return []
    }
  }

  /**
   * Map view data to User interface
   */
  private static mapViewToUser(viewData: UserProfileView): User {
    return {
      ...viewData,
      firstName: viewData.first_name,
      lastName: viewData.last_name,
      fullAddress: viewData.full_address,
      stats: [] // TODO: Calculate stats from other tables later
    }
  }

  /**
   * Map profile data and auth user data to User interface
   */
  private static mapProfileToUser(profile: ProfileRow, authUser: any): User {
    return {
      id: profile.id,
      email: authUser.email || '',
      phone: authUser.phone || '',
      created_at: authUser.created_at || null,
      updated_at: authUser.updated_at || null,
      first_name: profile.first_name,
      last_name: profile.last_name,
      biography: profile.biography,
      location: profile.location,
      full_address: profile.full_address,
      avatar_url: profile.avatar_url,
      role: profile.role,
      firstName: profile.first_name,
      lastName: profile.last_name,
      fullAddress: profile.full_address,
      stats: [] // TODO: Calculate stats from other tables later
    }
  }
}