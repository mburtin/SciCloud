/**
 * Base types used across the application
 * Compatible with Supabase conventions
 */

// Base primitive types
export type UUID = string
export type Timestamp = string

// Common enums
export type Priority = 'low' | 'medium' | 'high'

// Database entity base types
export interface TimestampedEntity {
  created_at: Timestamp
  updated_at: Timestamp
}

export interface IdentifiableEntity {
  id: UUID
}

export interface DatabaseEntity extends IdentifiableEntity, TimestampedEntity {}

// Generic API types
export interface ApiResponse<T> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Utility types
export type CreateInput<T> = Omit<T, keyof DatabaseEntity>
export type UpdateInput<T> = Partial<Omit<T, keyof IdentifiableEntity | 'created_at'>>