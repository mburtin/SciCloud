/**
 * User profile types
 */
import type { AuditableRecord, UUID } from './base'

// User role enum
export type UserRole = 'admin' | 'user' | 'viewer'

// User interface
export interface User extends AuditableRecord {
  id: UUID
  firstName: string
  lastName: string
  email: string
  role: UserRole
  avatar_url?: string
  biography: string
  phone: string
  location: string
  fullAddress: string
  stats: UserStat[]
}

// User statistics interface
export interface UserStat {
  label: string
  value: number
  icon: string
}
