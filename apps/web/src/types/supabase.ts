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
          role: 'admin' | 'user' | 'viewer'
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          biography?: string
          location?: string
          full_address?: string
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'viewer'
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          biography?: string
          location?: string
          full_address?: string
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'viewer'
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
          role: 'admin' | 'user' | 'viewer'
        }
      }
    }
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Type helpers for better usability
export type UserRole = Database['public']['Tables']['profiles']['Row']['role']
export type UserInsert = Database['public']['Tables']['profiles']['Insert']
export type UserUpdate = Database['public']['Tables']['profiles']['Update']

// Combined user_profiles view (raw data from SQL)
export type UserProfileView = Database['public']['Views']['user_profiles']['Row']

// Main User type based on combined view with camelCase mapping
export type User = UserProfileView & {
  firstName: string
  lastName: string
  fullAddress: string
  stats: UserStat[]
}

// User statistics interface (from previous user.ts)
export interface UserStat {
  label: string
  value: number
  icon: string
}