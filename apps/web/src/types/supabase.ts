/**
 * Supabase Database types
 * Generated types that match the database schema
 */

import type { AnimalDocument, MedicalRecord, Measurement } from './lab'

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
      animals: {
        Row: {
          id: string
          identifier: string
          species: string
          strain: string
          line: string | null
          sex: 'male' | 'female'
          age_weeks: number | null
          birth_date: string
          arrival_date: string
          current_weight: number
          supplier: string
          status: 'alive' | 'deceased' | 'transferred' | 'experimental'
          location: {
            facility: string
            room: string
            rack: string
            cage: string
          }
          housing_type: 'individual' | 'pair' | 'group'
          group_size: number | null
          protocols: string[]
          experimental_group: string | null
          ethics_approval: string
          veterinarian: string
          last_exam_date: string | null
          next_exam_date: string | null
          health_status: 'excellent' | 'good' | 'concerning' | 'critical'
          documents: AnimalDocument[]
          medical_history: MedicalRecord[]
          measurements: Measurement[]
          notes: string
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
          version: number
        }
        Insert: {
          id?: string
          identifier: string
          species: string
          strain: string
          line?: string | null
          sex: 'male' | 'female'
          age_weeks?: number | null
          birth_date: string
          arrival_date: string
          current_weight: number
          supplier: string
          status?: 'alive' | 'deceased' | 'transferred' | 'experimental'
          location: {
            facility: string
            room: string
            rack: string
            cage: string
          }
          housing_type?: 'individual' | 'pair' | 'group'
          group_size?: number | null
          protocols?: string[]
          experimental_group?: string | null
          ethics_approval: string
          veterinarian: string
          last_exam_date?: string | null
          next_exam_date?: string | null
          health_status?: 'excellent' | 'good' | 'concerning' | 'critical'
          documents?: AnimalDocument[]
          medical_history?: MedicalRecord[]
          measurements?: Measurement[]
          notes?: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          identifier?: string
          species?: string
          strain?: string
          line?: string | null
          sex?: 'male' | 'female'
          age_weeks?: number | null
          birth_date?: string
          arrival_date?: string
          current_weight?: number
          supplier?: string
          status?: 'alive' | 'deceased' | 'transferred' | 'experimental'
          location?: {
            facility: string
            room: string
            rack: string
            cage: string
          }
          housing_type?: 'individual' | 'pair' | 'group'
          group_size?: number | null
          protocols?: string[]
          experimental_group?: string | null
          ethics_approval?: string
          veterinarian?: string
          last_exam_date?: string | null
          next_exam_date?: string | null
          health_status?: 'excellent' | 'good' | 'concerning' | 'critical'
          documents?: AnimalDocument[]
          medical_history?: MedicalRecord[]
          measurements?: Measurement[]
          notes?: string
          updated_by?: string
        }
      }
      instruments: {
        Row: {
          id: string
          name: string
          model: string
          category: string
          manufacturer: string
          serial_number: string | null
          status: 'available' | 'in-use' | 'maintenance' | 'broken'
          location: string | null
          maintenance_due: boolean
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
          version: number
        }
        Insert: {
          id?: string
          name: string
          model: string
          category: string
          manufacturer: string
          serial_number?: string | null
          status?: 'available' | 'in-use' | 'maintenance' | 'broken'
          location?: string | null
          maintenance_due?: boolean
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          name?: string
          model?: string
          category?: string
          manufacturer?: string
          serial_number?: string | null
          status?: 'available' | 'in-use' | 'maintenance' | 'broken'
          location?: string | null
          maintenance_due?: boolean
          updated_by?: string
        }
      }
      consumables: {
        Row: {
          id: string
          reference: string
          name: string
          supplier: string
          category: string
          quantity: number
          unit: string
          stock: number
          min_stock: number
          stock_level: 'high' | 'normal' | 'low' | 'outofstock'
          location: string
          last_order: string | null
          expiry_date: string
          created_by: string
          created_at: string
          updated_by: string
          updated_at: string
          version: number
        }
        Insert: {
          id?: string
          reference: string
          name: string
          supplier: string
          category: string
          quantity: number
          unit: string
          stock: number
          min_stock: number
          stock_level?: 'high' | 'normal' | 'low' | 'outofstock'
          location: string
          last_order?: string | null
          expiry_date: string
          created_by: string
          updated_by: string
        }
        Update: {
          id?: string
          reference?: string
          name?: string
          supplier?: string
          category?: string
          quantity?: number
          unit?: string
          stock?: number
          min_stock?: number
          stock_level?: 'high' | 'normal' | 'low' | 'outofstock'
          location?: string
          last_order?: string | null
          expiry_date?: string
          updated_by?: string
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

// Animal types based on Database schema
export type Animal = Database['public']['Tables']['animals']['Row']
export type AnimalInsert = Database['public']['Tables']['animals']['Insert']
export type AnimalUpdate = Database['public']['Tables']['animals']['Update']

// Animal-specific enums (extracted from Database types)
export type AnimalStatus = 'alive' | 'deceased' | 'transferred' | 'experimental'
export type AnimalSex = 'male' | 'female'
export type HousingType = 'individual' | 'pair' | 'group'
export type HealthStatus = 'excellent' | 'good' | 'concerning' | 'critical'

// Instrument types based on Database schema
export type Instrument = Database['public']['Tables']['instruments']['Row']
export type InstrumentInsert = Database['public']['Tables']['instruments']['Insert']
export type InstrumentUpdate = Database['public']['Tables']['instruments']['Update']

// Instrument-specific enums (extracted from Database types)
export type InstrumentStatus = 'available' | 'in-use' | 'maintenance' | 'broken'

// Consumable types based on Database schema
export type Consumable = Database['public']['Tables']['consumables']['Row']
export type ConsumableInsert = Database['public']['Tables']['consumables']['Insert']
export type ConsumableUpdate = Database['public']['Tables']['consumables']['Update']

// Consumable-specific enums (extracted from Database types)
export type StockLevel = 'high' | 'normal' | 'low' | 'outofstock'
