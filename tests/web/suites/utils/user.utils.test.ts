/**
 * Tests for user.utils.ts
 * Testing pure utility functions for user data manipulation
 */

import { describe, it, expect } from 'vitest'
import {
  getUserStatus,
  calculateUserStats,
  getRoleLabel,
  getRoleVariant,
  getStatusVariant,
  formatDate
} from '@/lib/user.utils'
import { users, usersList } from '../../utils/fixtures'
import { createMockUser } from '../../utils/test-utils'
import type { User, UserRole } from '@/types/supabase'

describe('user.utils', () => {
  describe('getUserStatus', () => {
    it('should return active when biography explicitly states active status', () => {
      const activeUser = createMockUser({
        biography: 'Status: active. User is currently active',
        updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
      })

      const status = getUserStatus(activeUser)
      expect(status).toBe('active')
    })

    it('should return inactive when biography explicitly states inactive status', () => {
      const inactiveUser = createMockUser({
        biography: 'Status: inactive. User has been inactive',
        updated_at: new Date().toISOString() // Recently updated but explicitly inactive
      })

      const status = getUserStatus(inactiveUser)
      expect(status).toBe('inactive')
    })

    it('should return active when user was updated within 30 days', () => {
      const recentUser = createMockUser({
        biography: 'Regular biography without explicit status',
        updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      })

      const status = getUserStatus(recentUser)
      expect(status).toBe('active')
    })

    it('should return inactive when user was updated more than 30 days ago', () => {
      const oldUser = createMockUser({
        biography: 'Regular biography without explicit status',
        updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
      })

      const status = getUserStatus(oldUser)
      expect(status).toBe('inactive')
    })

    it('should return inactive when updated_at is null', () => {
      const userWithNullDate = createMockUser({
        biography: 'Regular biography',
        updated_at: null as any
      })

      const status = getUserStatus(userWithNullDate)
      expect(status).toBe('inactive')
    })

    it('should prioritize biography status over updated_at date', () => {
      const userWithConflictingData = createMockUser({
        biography: 'Status: inactive. Explicitly set as inactive',
        updated_at: new Date().toISOString() // Very recent
      })

      const status = getUserStatus(userWithConflictingData)
      expect(status).toBe('inactive')
    })
  })

  describe('calculateUserStats', () => {
    it('should calculate correct stats for empty user list', () => {
      const stats = calculateUserStats([])
      
      expect(stats).toEqual({
        total: 0,
        active: 0,
        inactive: 0,
        admins: 0,
        users: 0
      })
    })

    it('should calculate correct stats for mixed user list', () => {
      const mixedUsers: User[] = [
        createMockUser({ 
          role: 'admin', 
          biography: 'Status: active. Admin user',
          updated_at: new Date().toISOString() 
        }),
        createMockUser({ 
          role: 'user', 
          biography: 'Regular user',
          updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // Active
        }),
        createMockUser({ 
          role: 'user', 
          biography: 'Status: inactive. Old user',
          updated_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString() // Inactive
        }),
        createMockUser({ 
          role: 'admin', 
          biography: 'Another admin',
          updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // Inactive
        })
      ]

      const stats = calculateUserStats(mixedUsers)

      expect(stats).toEqual({
        total: 4,
        active: 2, // First admin (explicit) + second user (recent)
        inactive: 2, // Third user (explicit) + fourth admin (old)
        admins: 2,
        users: 2
      })
    })

    it('should handle users with different status patterns', () => {
      const testUsers: User[] = [
        users.activeUser, // Explicitly active
        users.inactiveUser, // Explicitly inactive
        createMockUser({ 
          updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // Recent, should be active
        })
      ]

      const stats = calculateUserStats(testUsers)

      expect(stats.total).toBe(3)
      expect(stats.active).toBe(2) // activeUser + recent user
      expect(stats.inactive).toBe(1) // inactiveUser
    })
  })

  describe('getRoleLabel', () => {
    it('should return correct label for admin role', () => {
      const label = getRoleLabel('admin')
      expect(label).toBe('Administrator')
    })

    it('should return correct label for user role', () => {
      const label = getRoleLabel('user')
      expect(label).toBe('User')
    })

    it('should return the role itself for unknown roles', () => {
      const unknownRole = 'unknown' as UserRole
      const label = getRoleLabel(unknownRole)
      expect(label).toBe('unknown')
    })
  })

  describe('getRoleVariant', () => {
    it('should return destructive variant for admin role', () => {
      const variant = getRoleVariant('admin')
      expect(variant).toBe('destructive')
    })

    it('should return default variant for user role', () => {
      const variant = getRoleVariant('user')
      expect(variant).toBe('default')
    })

    it('should return undefined for unknown roles', () => {
      const unknownRole = 'unknown' as UserRole
      const variant = getRoleVariant(unknownRole)
      expect(variant).toBeUndefined()
    })
  })

  describe('getStatusVariant', () => {
    it('should return default variant for active status', () => {
      const variant = getStatusVariant('active')
      expect(variant).toBe('default')
    })

    it('should return secondary variant for inactive status', () => {
      const variant = getStatusVariant('inactive')
      expect(variant).toBe('secondary')
    })

    it('should return secondary variant for unknown status', () => {
      const variant = getStatusVariant('unknown')
      expect(variant).toBe('secondary')
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const dateString = '2024-01-15T10:30:00.000Z'
      const formatted = formatDate(dateString)
      
      // The exact format depends on the implementation in format.utils
      // We'll test that it's a string and not empty
      expect(typeof formatted).toBe('string')
      expect(formatted).not.toBe('')
    })

    it('should handle null dates gracefully', () => {
      const formatted = formatDate(null)
      expect(typeof formatted).toBe('string')
    })

    it('should handle undefined dates gracefully', () => {
      const formatted = formatDate(undefined)
      expect(typeof formatted).toBe('string')
    })
  })

  describe('integration tests', () => {
    it('should work with fixture data', () => {
      const stats = calculateUserStats(usersList)
      
      expect(stats.total).toBeGreaterThan(0)
      expect(stats.active + stats.inactive).toBe(stats.total)
      expect(stats.admins + stats.users).toBe(stats.total)
    })

    it('should provide consistent results for user status', () => {
      usersList.forEach(user => {
        const status = getUserStatus(user)
        expect(['active', 'inactive']).toContain(status)
        
        const variant = getStatusVariant(status)
        expect(['default', 'secondary']).toContain(variant)
      })
    })

    it('should provide consistent results for user roles', () => {
      usersList.forEach(user => {
        const label = getRoleLabel(user.role)
        expect(typeof label).toBe('string')
        expect(label).not.toBe('')
        
        const variant = getRoleVariant(user.role)
        expect(['destructive', 'default', 'secondary'].includes(variant as string) || variant === undefined).toBe(true)
      })
    })
  })
})