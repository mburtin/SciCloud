import { supabase } from '@/lib/supabase'
import type { User, ProfileUpdate, UserRole } from '@/types/supabase'

export class UserService {

    // Fetch user by ID using secure function with proper permissions
    static async fetchUser(userId: string): Promise<User | null> {
      try {
          const { data, error } = await supabase
              .rpc('get_user_profile', { user_id: userId })
              .single()

          if (error) {
              return null
          }

          return data as User
      } catch {
          return null
      }
    }

    // Fetch all users using secure function (admin only)
    static async fetchAllUsers(): Promise<User[]> {
      try {
          const { data, error } = await supabase
              .rpc('get_all_user_profiles')

          if (error) {
              return []
          }

          return data || []
      } catch {
          return []
      }
    }

    // Create a new user using Edge Function (secure server-side creation)
    static async createUser(userData: {
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
          // Call our secure Edge Function for user creation
          const { data, error } = await supabase.functions.invoke('create-user', {
              body: {
                  email: userData.email,
                  password: userData.password,
                  first_name: userData.first_name,
                  last_name: userData.last_name,
                  biography: userData.biography,
                  location: userData.location,
                  full_address: userData.full_address,
                  avatar_url: userData.avatar_url,
                  role: userData.role
              }
          })

          if (error) {
              return { success: false, error: error.message || 'Failed to call user creation function' }
          }

          // Edge function returns { success, data?, error? }
          if (!data?.success) {
              return { success: false, error: data?.error || 'Unknown error from user creation function' }
          }

          // Return the data from Edge function directly
          // Note: We don't fetch the complete user profile here because it requires authentication
          // and during admin creation, no user is logged in yet
          return { success: true, data: data.data as User }
      } catch {
          const errorMessage = "Unknown error"; // 'Unknown error'
          return { success: false, error: errorMessage }
      }
    }
    
    // Delete user using Edge Function (secure server-side deletion)
    static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
      try {
          // Call our secure Edge Function for user deletion
          const { data, error } = await supabase.functions.invoke('delete-user', {
              body: {
                  userId: userId
              }
          })

          if (error) {
              return { success: false, error: error.message || 'Failed to call user deletion function' }
          }

          // Edge function returns { success, error? }
          if (!data?.success) {
              return { success: false, error: data?.error || 'Unknown error from user deletion function' }
          }
          return { success: true }
      } catch {
          const errorMessage = "Unknown error"; // 'Unknown error'
          return { success: false, error: errorMessage }
      }
    }

    // Update profile data (including role)
    static async updateProfile(userId: string, profileData: Partial<ProfileUpdate>): Promise<{ success: boolean; data?: User; error?: string }> {
      try {
          // Remove undefined values
          const cleanProfileData = Object.fromEntries(
              Object.entries(profileData).filter(([, value]) => value !== undefined)
          ) as ProfileUpdate

          // If updating role, use the admin RPC function for proper permissions
          if (cleanProfileData.role !== undefined) {
              const { error: roleError } = await supabase
                  .rpc('admin_update_user_role', {
                      target_user_id: userId,
                      new_role: cleanProfileData.role
                  })

              if (roleError) {
                  return { success: false, error: roleError.message }
              }

              // Remove role from profileData since it's already updated via RPC
              const { ...profileDataWithoutRole } = cleanProfileData
              delete profileDataWithoutRole.role
              
              // Update remaining profile fields if any
              if (Object.keys(profileDataWithoutRole).length > 0) {
                  const { error } = await supabase
                      .from('user_profiles')
                      .update(profileDataWithoutRole)
                      .eq('id', userId)

                  if (error) {
                      return { success: false, error: error.message }
                  }
              }
          } else {
              // No role update, just update profile fields
              const { error } = await supabase
                  .from('user_profiles')
                  .update(cleanProfileData)
                  .eq('id', userId)

              if (error) {
                  return { success: false, error: error.message }
              }
          }

          // Fetch updated user data
          const updatedUser = await this.fetchUser(userId)
          if (!updatedUser) {
              return { success: false, error: 'Profile updated but could not fetch updated data' }
          }

          return { success: true, data: updatedUser }
      } catch {
          const errorMessage = "Unknown error"; // 'Unknown error'
          return { success: false, error: errorMessage }
      }
    }

    // Verify current password by attempting to sign in
    static async verifyCurrentPassword(email: string, currentPassword: string): Promise<{ success: boolean; error?: string }> {
      try {
          // Sign in with current credentials to verify password
          const { error } = await supabase.auth.signInWithPassword({
              email,
              password: currentPassword
          })

          if (error) {
              return { success: false, error: 'Current password is incorrect' }
          }

          return { success: true }
      } catch {
          const errorMessage = "Unknown error"; // 'Failed to verify password'
          return { success: false, error: errorMessage }
      }
    }

    // Update current user's password (self-service)
    static async updatePassword(currentPassword: string, newPassword: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
      try {
          // First verify the current password
          const verifyResult = await this.verifyCurrentPassword(userEmail, currentPassword)
          if (!verifyResult.success) {
              return verifyResult
          }

          // Check if new password is different from current
          if (currentPassword === newPassword) {
              return { success: false, error: 'New password must be different from your current password' }
          }

          const { error } = await supabase.auth.updateUser({
              password: newPassword
          })

          if (error) {
              return { success: false, error: error.message }
          }

          return { success: true }
      } catch {
          const errorMessage = "Unknown error"; // 'Unknown error'
          return { success: false, error: errorMessage }
      }
    }

    // Update current user's email (self-service)
    static async updateEmail(newEmail: string): Promise<{ success: boolean; error?: string }> {
      try {
          const { error } = await supabase.auth.updateUser({
              email: newEmail
          })

          if (error) {
              return { success: false, error: error.message }
          }

          return { success: true }
      } catch {
          const errorMessage = "Unknown error"; // 'Unknown error'
          return { success: false, error: errorMessage }
      }
    }

    // Update current user's phone number (self-service)
    static async updatePhone(newPhone: string): Promise<{ success: boolean; error?: string }> {
      try {
          const { error } = await supabase.auth.updateUser({
              phone: newPhone
          })

          if (error) {
              return { success: false, error: error.message }
          }

          return { success: true }
      } catch {
          const errorMessage = "Unknown error"; // 'Unknown error'
          return { success: false, error: errorMessage }
      }
    }

    // Search user ID by first name or last name (profiles table only)
    static async searchUserID(query: string): Promise<string | null> {
      try {
          if (!query.trim()) {
              return null
          }

          const searchTerm = query.trim().toLowerCase()

          const { data, error } = await supabase
              .from('user_profiles')
              .select('id')
              .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`)
              .limit(1)
              .single()

          if (error) {
              return null
          }

          return data?.id || null
      } catch {
          return null
      }
    }

    // Check if any users exist (public function for bootstrap purposes)
    static async usersExist(): Promise<boolean> {
      try {
          const { data, error } = await supabase.rpc('users_exist')
          
          if (error) {
              return false
          }
          
          return data === true
      } catch {
          return false
      }
    }

}
