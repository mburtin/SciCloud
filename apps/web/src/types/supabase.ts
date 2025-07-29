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
          phone: string
          location: string
          full_address: string
          avatar_url: string | null
          role: 'admin' | 'user' | 'viewer'
          created_by: string | null
          created_at: string
          updated_by: string | null
          updated_at: string
          version: number
        }
        Insert: {
          id: string
          first_name: string
          last_name: string
          biography?: string
          phone?: string
          location?: string
          full_address?: string
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'viewer'
          created_by?: string | null
          created_at?: string
          updated_by?: string | null
          updated_at?: string
          version?: number
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          biography?: string
          phone?: string
          location?: string
          full_address?: string
          avatar_url?: string | null
          role?: 'admin' | 'user' | 'viewer'
          created_by?: string | null
          created_at?: string
          updated_by?: string | null
          updated_at?: string
          version?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}