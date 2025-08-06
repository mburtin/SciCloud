/**
 * Tests for UserStore
 * Testing Pinia store with reactive state management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { createMockUser } from '@/test/utils/test-utils'
import { mockUsers } from '@/test/__mocks__/supabase.mock'
import type { User } from '@/types/supabase'

// Mock the UserService using vi.hoisted
const mockUserService = vi.hoisted(() => ({
  fetchUser: vi.fn(),
  fetchAllUsers: vi.fn(),
  createUser: vi.fn(),
  updateProfile: vi.fn(),
  updateEmail: vi.fn(),
  updatePassword: vi.fn(),
  deleteUser: vi.fn(),
  searchUserID: vi.fn(),
  usersExist: vi.fn()
}))

vi.mock('@/services/user.service', () => ({
  UserService: mockUserService
}))

// Mock the auth store using vi.hoisted
const mockAuthStore = vi.hoisted(() => ({
  user: { id: 'auth-user-1', email: 'test@example.com' }
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: () => mockAuthStore
}))

describe('UserStore', () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test
    setActivePinia(createPinia())
    
    // Reset all mocks
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const store = useUserStore()
      
      expect(store.users).toEqual([])
      expect(store.currentUserProfile).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should have correct initial computed values', () => {
      const store = useUserStore()
      
      expect(store.allUsers).toEqual([])
      expect(store.userCount).toBe(0)
      expect(store.adminUsers).toEqual([])
      expect(store.regularUsers).toEqual([])
    })
  })

  describe('getUser', () => {
    it('should fetch and return user successfully', async () => {
      const store = useUserStore()
      const mockUser = mockUsers[0]
      
      mockUserService.fetchUser.mockResolvedValueOnce(mockUser)

      const result = await store.getUser(mockUser.id)

      expect(mockUserService.fetchUser).toHaveBeenCalledWith(mockUser.id)
      expect(result).toEqual(mockUser)
      expect(store.users).toContainEqual(mockUser)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle user not found', async () => {
      const store = useUserStore()
      
      mockUserService.fetchUser.mockResolvedValueOnce(null)

      const result = await store.getUser('non-existent-id')

      expect(result).toBeNull()
      expect(store.loading).toBe(false)
    })

    it('should handle errors', async () => {
      const store = useUserStore()
      
      mockUserService.fetchUser.mockRejectedValueOnce(new Error('Network error'))

      const result = await store.getUser('user-id')

      expect(result).toBeNull()
      expect(store.error).toBe('Network error')
      expect(store.loading).toBe(false)
    })

    it('should update existing user in cache', async () => {
      const store = useUserStore()
      const originalUser = mockUsers[0]
      const updatedUser = { ...originalUser, first_name: 'Updated' }
      
      // Add original user to cache first
      store.users.push(originalUser)
      
      mockUserService.fetchUser.mockResolvedValueOnce(updatedUser)

      const result = await store.getUser(originalUser.id)

      expect(result).toEqual(updatedUser)
      expect(store.users[0]).toEqual(updatedUser)
    })
  })

  describe('getAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const store = useUserStore()
      const users = mockUsers
      
      mockUserService.fetchAllUsers.mockResolvedValueOnce(users)

      const result = await store.getAllUsers()

      expect(mockUserService.fetchAllUsers).toHaveBeenCalled()
      expect(result).toEqual(users)
      expect(store.users).toEqual(users)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle fetch errors', async () => {
      const store = useUserStore()
      
      mockUserService.fetchAllUsers.mockRejectedValueOnce(new Error('Database error'))

      const result = await store.getAllUsers()

      expect(result).toEqual([])
      expect(store.error).toBe('Database error')
      expect(store.loading).toBe(false)
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const store = useUserStore()
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      }
      const createdUser = createMockUser(userData)
      
      mockUserService.createUser.mockResolvedValueOnce({
        success: true,
        data: createdUser
      })

      const result = await store.createUser(userData)

      expect(mockUserService.createUser).toHaveBeenCalledWith(userData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdUser)
      expect(store.users).toContainEqual(createdUser)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle creation errors', async () => {
      const store = useUserStore()
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      }
      
      mockUserService.createUser.mockResolvedValueOnce({
        success: false,
        error: 'Email already exists'
      })

      const result = await store.createUser(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
      expect(store.error).toBe('Email already exists')
      expect(store.loading).toBe(false)
    })

    it('should handle unexpected errors', async () => {
      const store = useUserStore()
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        first_name: 'New',
        last_name: 'User'
      }
      
      mockUserService.createUser.mockRejectedValueOnce(new Error('Network error'))

      const result = await store.createUser(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(store.error).toBe('Network error')
    })
  })

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const store = useUserStore()
      const userId = 'user-1'
      const profileData = { first_name: 'Updated' }
      const originalUser = createMockUser({ id: userId })
      const updatedUser = { ...originalUser, ...profileData }
      
      // Add original user to cache
      store.users.push(originalUser)
      
      mockUserService.updateProfile.mockResolvedValueOnce({
        success: true,
        data: updatedUser
      })

      const result = await store.updateProfile(userId, profileData)

      expect(mockUserService.updateProfile).toHaveBeenCalledWith(userId, profileData)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(updatedUser)
      expect(store.users[0]).toEqual(updatedUser)
      expect(store.loading).toBe(false)
    })

    it('should update current user profile if same user', async () => {
      const store = useUserStore()
      const userId = 'auth-user-1'
      const profileData = { first_name: 'Updated' }
      const originalUser = createMockUser({ id: userId })
      const updatedUser = { ...originalUser, ...profileData }
      
      // Load current user first
      mockUserService.fetchUser.mockResolvedValueOnce(originalUser)
      await store.loadCurrentUserProfile()
      
      // Now update profile
      mockUserService.updateProfile.mockResolvedValueOnce({
        success: true,
        data: updatedUser
      })

      await store.updateProfile(userId, profileData)

      expect(store.currentUserProfile).toEqual(updatedUser)
    })

    it('should handle update errors', async () => {
      const store = useUserStore()
      const userId = 'user-1'
      const profileData = { first_name: 'Updated' }
      
      mockUserService.updateProfile.mockResolvedValueOnce({
        success: false,
        error: 'Permission denied'
      })

      const result = await store.updateProfile(userId, profileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Permission denied')
      expect(store.error).toBe('Permission denied')
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const store = useUserStore()
      const userToDelete = mockUsers[0]
      
      // Add users to cache
      store.users.push(...mockUsers)
      
      mockUserService.deleteUser.mockResolvedValueOnce({ success: true })

      const result = await store.deleteUser(userToDelete.id)

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(userToDelete.id)
      expect(result.success).toBe(true)
      expect(store.users).not.toContain(userToDelete)
      expect(store.loading).toBe(false)
    })

    it('should clear current user profile if same user deleted', async () => {
      const store = useUserStore()
      const userToDelete = mockUsers[0]
      
      // Load current user first
      mockUserService.fetchUser.mockResolvedValueOnce(userToDelete)
      await store.loadCurrentUserProfile()
      
      mockUserService.deleteUser.mockResolvedValueOnce({ success: true })

      await store.deleteUser(userToDelete.id)

      expect(store.currentUserProfile).toBeNull()
    })

    it('should handle deletion errors', async () => {
      const store = useUserStore()
      
      mockUserService.deleteUser.mockResolvedValueOnce({
        success: false,
        error: 'User not found'
      })

      const result = await store.deleteUser('user-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
      expect(store.error).toBe('User not found')
    })
  })

  describe('updateEmail', () => {
    it('should update email successfully', async () => {
      const store = useUserStore()
      const newEmail = 'new@example.com'
      
      mockUserService.updateEmail.mockResolvedValueOnce({ success: true })

      const result = await store.updateEmail(newEmail)

      expect(mockUserService.updateEmail).toHaveBeenCalledWith(newEmail)
      expect(result.success).toBe(true)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('should handle email update errors', async () => {
      const store = useUserStore()
      const newEmail = 'new@example.com'
      
      mockUserService.updateEmail.mockResolvedValueOnce({
        success: false,
        error: 'Email already exists'
      })

      const result = await store.updateEmail(newEmail)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
      expect(store.error).toBe('Email already exists')
    })
  })

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const store = useUserStore()
      const currentPassword = 'old123'
      const newPassword = 'new123'
      const email = 'test@example.com'
      
      mockUserService.updatePassword.mockResolvedValueOnce({ success: true })

      const result = await store.updatePassword(currentPassword, newPassword, email)

      expect(mockUserService.updatePassword).toHaveBeenCalledWith(currentPassword, newPassword, email)
      expect(result.success).toBe(true)
      expect(store.loading).toBe(false)
    })

    it('should handle password update errors', async () => {
      const store = useUserStore()
      const currentPassword = 'old123'
      const newPassword = 'new123'
      const email = 'test@example.com'
      
      mockUserService.updatePassword.mockResolvedValueOnce({
        success: false,
        error: 'Current password is incorrect'
      })

      const result = await store.updatePassword(currentPassword, newPassword, email)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Current password is incorrect')
      expect(store.error).toBe('Current password is incorrect')
    })
  })

  describe('searchUserID', () => {
    it('should search user ID successfully', async () => {
      const store = useUserStore()
      const searchTerm = 'John'
      const userId = 'user-1'
      
      mockUserService.searchUserID.mockResolvedValueOnce(userId)

      const result = await store.searchUserID(searchTerm)

      expect(mockUserService.searchUserID).toHaveBeenCalledWith(searchTerm)
      expect(result).toBe(userId)
      expect(store.loading).toBe(false)
    })

    it('should handle search errors', async () => {
      const store = useUserStore()
      const searchTerm = 'John'
      
      mockUserService.searchUserID.mockRejectedValueOnce(new Error('Search failed'))

      const result = await store.searchUserID(searchTerm)

      expect(result).toBeNull()
      expect(store.error).toBe('Search failed')
    })
  })

  describe('computed properties', () => {
    it('should compute allUsers correctly (sorted by creation date)', () => {
      const store = useUserStore()
      const user1 = createMockUser({ 
        id: '1', 
        created_at: '2024-01-01T00:00:00.000Z' 
      })
      const user2 = createMockUser({ 
        id: '2', 
        created_at: '2024-01-02T00:00:00.000Z' 
      })
      
      store.users.push(user1, user2)

      expect(store.allUsers).toEqual([user2, user1]) // Most recent first
    })

    it('should compute userCount correctly', () => {
      const store = useUserStore()
      
      expect(store.userCount).toBe(0)
      
      store.users.push(...mockUsers)
      
      expect(store.userCount).toBe(mockUsers.length)
    })

    it('should compute adminUsers correctly', () => {
      const store = useUserStore()
      const adminUser = createMockUser({ role: 'admin' })
      const regularUser = createMockUser({ role: 'user' })
      
      store.users.push(adminUser, regularUser)

      expect(store.adminUsers).toEqual([adminUser])
    })

    it('should compute regularUsers correctly', () => {
      const store = useUserStore()
      const adminUser = createMockUser({ role: 'admin' })
      const regularUser = createMockUser({ role: 'user' })
      
      store.users.push(adminUser, regularUser)

      expect(store.regularUsers).toEqual([regularUser])
    })
  })

  describe('loadCurrentUserProfile', () => {
    it('should load current user profile successfully', async () => {
      const store = useUserStore()
      const currentUser = createMockUser({ id: 'auth-user-1' })
      
      mockUserService.fetchUser.mockResolvedValueOnce(currentUser)

      await store.loadCurrentUserProfile()

      expect(mockUserService.fetchUser).toHaveBeenCalledWith('auth-user-1')
      expect(store.currentUserProfile).toEqual(currentUser)
    })

    it('should handle missing auth user', async () => {
      const store = useUserStore()
      mockAuthStore.user = null

      await store.loadCurrentUserProfile()

      expect(mockUserService.fetchUser).not.toHaveBeenCalled()
      expect(store.currentUserProfile).toBeNull()
    })
  })

  describe('checkUsersExist', () => {
    it('should return true when users exist', async () => {
      const store = useUserStore()
      
      mockUserService.usersExist.mockResolvedValueOnce(true)

      const result = await store.checkUsersExist()

      expect(mockUserService.usersExist).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('should return false when no users exist', async () => {
      const store = useUserStore()
      
      mockUserService.usersExist.mockResolvedValueOnce(false)

      const result = await store.checkUsersExist()

      expect(result).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      const store = useUserStore()
      
      mockUserService.usersExist.mockRejectedValueOnce(new Error('Database error'))

      const result = await store.checkUsersExist()

      expect(result).toBe(false)
    })
  })

  describe('refreshCache', () => {
    it('should refresh the user cache', async () => {
      const store = useUserStore()
      
      mockUserService.fetchAllUsers.mockResolvedValueOnce(mockUsers)

      await store.refreshCache()

      expect(mockUserService.fetchAllUsers).toHaveBeenCalled()
      expect(store.users).toEqual(mockUsers)
    })
  })

  describe('getCurrentUser', () => {
    it('should return current user profile', async () => {
      const store = useUserStore()
      const currentUser = createMockUser({ id: 'auth-user-1' })
      
      // Make sure auth user exists
      mockAuthStore.user = { id: 'auth-user-1', email: 'test@example.com' }
      
      // Load current user first
      mockUserService.fetchUser.mockResolvedValueOnce(currentUser)
      await store.loadCurrentUserProfile()

      const result = store.getCurrentUser()

      expect(result).toEqual(currentUser)
    })

    it('should return null if no current user', () => {
      const store = useUserStore()

      const result = store.getCurrentUser()

      expect(result).toBeNull()
    })
  })
})