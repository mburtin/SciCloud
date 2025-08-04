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
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          status: 'active' | 'planning' | 'completed' | 'paused' | 'archived'
          priority: 'low' | 'medium' | 'high'
          progress: number
          responsible: string
          tags: string[] | null
          budget: number
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
          version: number
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          category: string
          status?: 'active' | 'planning' | 'completed' | 'paused' | 'archived'
          priority?: 'low' | 'medium' | 'high'
          progress?: number
          responsible: string
          tags?: string[] | null
          budget?: number
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          category?: string
          status?: 'active' | 'planning' | 'completed' | 'paused' | 'archived'
          priority?: 'low' | 'medium' | 'high'
          progress?: number
          responsible?: string
          tags?: string[] | null
          budget?: number
          updated_by?: string
        }
      }
      project_members: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member' | 'viewer'
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
          version: number
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'member' | 'viewer'
          updated_by?: string
        }
      }
      user_favorite_projects: {
        Row: {
          id: string
          user_id: string
          project_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string
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

// Project types based on Database schema
export type Project = Database['public']['Tables']['projects']['Row'] & {
  // Relations (optional for populated queries)
  members?: User[]
  // Computed field (populated by services based on current user)
  is_favorite?: boolean
}
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Project Member types
export type ProjectMember = Database['public']['Tables']['project_members']['Row']
export type ProjectMemberInsert = Database['public']['Tables']['project_members']['Insert']
export type ProjectMemberUpdate = Database['public']['Tables']['project_members']['Update']

// User Favorite Project types
export type UserFavoriteProject = Database['public']['Tables']['user_favorite_projects']['Row']
export type UserFavoriteProjectInsert = Database['public']['Tables']['user_favorite_projects']['Insert']
export type UserFavoriteProjectUpdate = Database['public']['Tables']['user_favorite_projects']['Update']

// Project-specific enums (extracted from Database types)
export type ProjectStatus = 'active' | 'planning' | 'completed' | 'paused' | 'archived'
export type ProjectMemberRole = 'owner' | 'admin' | 'member' | 'viewer'
export type Priority = 'low' | 'medium' | 'high'
