/**
 * Supabase Database types
 * Generated types that match the database schema
 */

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          biography: string
          location: string
          full_address: string
          avatar_url: string | null
          role: 'admin' | 'user'
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          biography?: string
          location?: string
          full_address?: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          biography?: string
          location?: string
          full_address?: string
          avatar_url?: string | null
          role?: 'admin' | 'user'
        }
      }
    }
    Views: {
      user_profiles: {
        Row: {
          id: string
          email: string | null
          phone: string | null
          created_at: string | null
          updated_at: string | null
          first_name: string
          last_name: string
          biography: string
          location: string
          full_address: string
          avatar_url: string | null
          role: 'admin' | 'user'
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Unified User type based on user_profiles view (combines auth.users + profiles)
export type User = Database['public']['Views']['user_profiles']['Row']

// Profile-specific types (for direct profile table operations)
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

// User role type
export type UserRole = 'admin' | 'user'
