/**
 * Tests for UserService
 * Testing all static methods in UserService class
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockUser } from '../../utils/test-utils'

// Create inline fixtures to avoid import errors
const createUserData = {
  valid: {
    email: 'newuser@example.com',
    password: 'securepassword123',
    first_name: 'New',
    last_name: 'User',
    biography: 'New user biography',
    location: 'New City',
    role: 'user' as const
  }
}

const profileUpdates = {
  basic: {
    first_name: 'Updated',
    last_name: 'Name',
    biography: 'Updated biography'
  }
}

const mockUsers = [
  createMockUser({
    id: 'mock-admin-1',
    email: 'admin@example.com',
    first_name: 'John',
    last_name: 'Doe',
    role: 'admin' as const
  })
]

// Helper functions for mocking
const resetSupabaseMocks = () => {
  vi.clearAllMocks()
}

const setMockAuthUser = (user: any) => {
  if (user) {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user },
      error: null
    })
    mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
      data: { user },
      error: null
    })
  } else {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Auth session missing!' }
    })
    mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Auth session missing!' }
    })
  }
}

const setupMockResponses = {
  getUserSuccess: (user: any) => {
    const mockRpcChain = { single: vi.fn().mockResolvedValueOnce({ data: user, error: null }) }
    mockSupabaseClient.rpc.mockReturnValueOnce(mockRpcChain)
  },
  getAllUsersSuccess: (users: any[]) => {
    mockSupabaseClient.rpc.mockResolvedValueOnce({ data: users, error: null })
  },
  createUserSuccess: (userData: any) => {
    mockSupabaseClient.functions.invoke.mockResolvedValueOnce({
      data: { success: true, data: userData },
      error: null
    })
  },
  deleteUserSuccess: () => {
    mockSupabaseClient.functions.invoke.mockResolvedValueOnce({
      data: { success: true },
      error: null
    })
  },
  rpcError: (message: string) => {
    const mockRpcChain = { single: vi.fn().mockResolvedValueOnce({ data: null, error: { message } }) }
    mockSupabaseClient.rpc.mockReturnValueOnce(mockRpcChain)
  },
  edgeFunctionError: (message: string) => {
    mockSupabaseClient.functions.invoke.mockResolvedValueOnce({
      data: { success: false, error: message },
      error: null
    })
  },
  authError: (message: string) => {
    mockSupabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: { user: null },
      error: { message }
    })
  },
  updateProfileSuccess: () => {
    const chain = mockSupabaseClient.from()
    // Override the final method in the chain to return success
    chain.single = vi.fn().mockResolvedValueOnce({ data: null, error: null })
    return chain
  },
  databaseError: (message: string) => {
    const chain = mockSupabaseClient.from()
    // Override the final method in the chain to return error
    chain.single = vi.fn().mockResolvedValueOnce({ data: null, error: { message } })
    return chain
  },
  usersExistSuccess: (exists: boolean) => {
    mockSupabaseClient.rpc.mockResolvedValueOnce({ data: exists, error: null })
  }
}

// Mock the Supabase module at the top level using vi.hoisted
const mockSupabaseClient = vi.hoisted(() => {
  const createQueryChain = () => {
    const chain = {
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      neq: vi.fn(),
      gt: vi.fn(),
      gte: vi.fn(),
      lt: vi.fn(),
      lte: vi.fn(),
      like: vi.fn(),
      ilike: vi.fn(),
      is: vi.fn(),
      in: vi.fn(),
      contains: vi.fn(),
      containedBy: vi.fn(),
      rangeGt: vi.fn(),
      rangeGte: vi.fn(),
      rangeLt: vi.fn(),
      rangeLte: vi.fn(),
      rangeAdjacent: vi.fn(),
      overlaps: vi.fn(),
      textSearch: vi.fn(),
      match: vi.fn(),
      not: vi.fn(),
      or: vi.fn(),
      filter: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    // Make all chain methods return the chain to support method chaining
    Object.keys(chain).forEach(key => {
      if (key !== 'single' && key !== 'maybeSingle') {
        chain[key] = chain[key].mockReturnValue(chain)
      }
    })

    return chain
  }

  return {
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: {} }, error: null }),
      admin: {
        createUser: vi.fn(),
        deleteUser: vi.fn(),
      }
    },
    from: vi.fn().mockImplementation(() => createQueryChain()),
    rpc: vi.fn().mockResolvedValue({ data: null, error: null }),
    functions: {
      invoke: vi.fn(),
    }
  }
})

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabaseClient
}))

// Now import the service after mocking
import { UserService } from '@/services/user.service'

describe('UserService', () => {
  beforeEach(() => {
    resetSupabaseMocks()
  })

  describe('fetchUser', () => {
    it('should fetch user successfully', async () => {
      const mockUser = mockUsers[0]
      setupMockResponses.getUserSuccess(mockUser)

      const result = await UserService.fetchUser(mockUser.id)

      expect(result).toEqual(mockUser)
    })

    it('should return null when user not found', async () => {
      setupMockResponses.rpcError('User not found')

      const result = await UserService.fetchUser('non-existent-id')

      expect(result).toBeNull()
    })

    it('should handle database errors gracefully', async () => {
      setupMockResponses.rpcError('Database connection failed')

      const result = await UserService.fetchUser('user-id')

      expect(result).toBeNull()
    })

    it('should handle unexpected errors', async () => {
      // Mock a rejection (network error) - RPC returns a rejected promise directly
      mockSupabaseClient.rpc.mockRejectedValueOnce(new Error('Network error'))

      const result = await UserService.fetchUser('user-id')

      expect(result).toBeNull()
    })
  })

  describe('fetchAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const users = mockUsers
      setupMockResponses.getAllUsersSuccess(users)

      const result = await UserService.fetchAllUsers()

      expect(result).toEqual(users)
    })

    it('should return empty array when no users found', async () => {
      setupMockResponses.getAllUsersSuccess([])

      const result = await UserService.fetchAllUsers()

      expect(result).toEqual([])
    })

    it('should handle database errors gracefully', async () => {
      setupMockResponses.rpcError('Access denied')

      const result = await UserService.fetchAllUsers()

      expect(result).toEqual([])
    })
  })

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const userData = createUserData.valid
      const createdUser = createMockUser(userData)
      setupMockResponses.createUserSuccess(createdUser)

      const result = await UserService.createUser(userData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(createdUser)
      expect(result.error).toBeUndefined()
    })

    it('should handle edge function returning error', async () => {
      const userData = createUserData.valid
      setupMockResponses.edgeFunctionError('Email already exists')

      const result = await UserService.createUser(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
    })

    it('should handle network errors', async () => {
      const userData = createUserData.valid
      mockSupabaseClient.functions.invoke.mockRejectedValueOnce(new Error('Network error'))

      const result = await UserService.createUser(userData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('deleteUser', () => {
    const userIdToDelete = 'user-to-delete'

    it('should delete user successfully', async () => {
      setupMockResponses.deleteUserSuccess()

      const result = await UserService.deleteUser(userIdToDelete)

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should handle deletion errors', async () => {
      setupMockResponses.edgeFunctionError('User not found')

      const result = await UserService.deleteUser(userIdToDelete)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })
  })

  describe('updateProfile', () => {
    const userId = 'user-1'
    const mockUpdatedUser = createMockUser({ id: userId, first_name: 'Updated' })

    it('should update profile without role change', async () => {
      const profileData = profileUpdates.basic
      
      // Setup mocks for profile update and user fetch
      const chain = mockSupabaseClient.from()
      // Mock successful update - the update().eq() chain should return success
      chain.single = vi.fn().mockResolvedValueOnce({ data: null, error: null })
      
      // Mock successful user fetch after update
      setupMockResponses.getUserSuccess(mockUpdatedUser)

      const result = await UserService.updateProfile(userId, profileData)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUpdatedUser)
    })

    it('should update profile with role change', async () => {
      const profileDataWithRole = { ...profileUpdates.basic, role: 'admin' as const }
      
      // Mock the RPC calls in sequence
      mockSupabaseClient.rpc
        .mockResolvedValueOnce({ data: null, error: null }) // admin_update_user_role
        .mockReturnValueOnce({ single: vi.fn().mockResolvedValueOnce({ data: mockUpdatedUser, error: null }) }) // get_user_profile
      
      // Mock profile update success - from() chain for remaining fields
      const mockFromChain = mockSupabaseClient.from()
      mockFromChain.single = vi.fn().mockResolvedValueOnce({ data: null, error: null })

      const result = await UserService.updateProfile(userId, profileDataWithRole)

      expect(result.success).toBe(true)
    })

    it('should handle role update errors', async () => {
      const profileDataWithRole = { role: 'admin' as const }
      
      // Mock RPC to return error for role update
      mockSupabaseClient.rpc.mockResolvedValueOnce({ data: null, error: { message: 'Permission denied' } })

      const result = await UserService.updateProfile(userId, profileDataWithRole)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Permission denied')
    })

    it('should handle profile update errors', async () => {
      const profileData = profileUpdates.basic
      
      // Mock database error in from() chain - le service fait .update().eq(), il faut mocker ça
      const mockFromChain = mockSupabaseClient.from()
      // Créer une chaîne qui échoue dès .eq() pour éviter l'appel à fetchUser après
      const errorResponse = { data: null, error: { message: 'Update failed' } }
      mockFromChain.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue(errorResponse)
      })
      // S'assurer que from() renvoie notre chaîne mockée
      mockSupabaseClient.from.mockReturnValueOnce(mockFromChain)

      const result = await UserService.updateProfile(userId, profileData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Update failed')
    })
  })

  describe('verifyCurrentPassword', () => {
    const email = 'test@example.com'
    const password = 'password123'

    it('should verify password successfully', async () => {
      // Set up successful auth
      setMockAuthUser({ email })

      const result = await UserService.verifyCurrentPassword(email, password)

      expect(result.success).toBe(true)
    })

    it('should handle incorrect password', async () => {
      setupMockResponses.authError('Invalid credentials')

      const result = await UserService.verifyCurrentPassword(email, 'wrong-password')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Current password is incorrect')
    })
  })

  describe('updatePassword', () => {
    const currentPassword = 'oldpassword'
    const newPassword = 'newpassword'
    const email = 'test@example.com'

    it('should update password successfully', async () => {
      // Mock successful password verification and update
      setMockAuthUser({ email })

      const result = await UserService.updatePassword(currentPassword, newPassword, email)

      expect(result.success).toBe(true)
    })

    it('should reject same password', async () => {
      // Mock successful password verification
      setMockAuthUser({ email })

      const result = await UserService.updatePassword(currentPassword, currentPassword, email)

      expect(result.success).toBe(false)
      expect(result.error).toBe('New password must be different from your current password')
    })

    it('should handle incorrect current password', async () => {
      setupMockResponses.authError('Invalid credentials')

      const result = await UserService.updatePassword('wrong-password', newPassword, email)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Current password is incorrect')
    })
  })

  describe('updateEmail', () => {
    const newEmail = 'newemail@example.com'

    it('should update email successfully', async () => {
      setMockAuthUser({ email: 'old@example.com' })

      const result = await UserService.updateEmail(newEmail)

      expect(result.success).toBe(true)
    })

    it('should handle update errors', async () => {
      // Réinitialiser le mock pour ce test spécifique
      mockSupabaseClient.auth.updateUser.mockReset()
      // Mock auth error for updateUser - s'assurer que l'erreur est renvoyée
      mockSupabaseClient.auth.updateUser.mockResolvedValueOnce({
        data: null,
        error: { message: 'Auth session missing!' }
      })

      const result = await UserService.updateEmail(newEmail)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Auth session missing!')
    })
  })

  describe('searchUserID', () => {
    it('should find user ID by name', async () => {
      const searchTerm = 'John'
      const expectedUser = { id: mockUsers[0].id }
      
      // Mock the complete chain: from().select().or().limit().single()
      const mockFromChain = mockSupabaseClient.from()
      // Override the entire chain to return the expected result at the end
      mockFromChain.single = vi.fn().mockResolvedValueOnce({ data: expectedUser, error: null })
      
      // Ensure the from() call returns our configured chain
      mockSupabaseClient.from.mockReturnValueOnce(mockFromChain)

      const result = await UserService.searchUserID(searchTerm)

      expect(result).toBe(expectedUser.id)
    })

    it('should return null for empty search term', async () => {
      const result = await UserService.searchUserID('')

      expect(result).toBeNull()
    })

    it('should return null when no user found', async () => {
      const mockFromChain = mockSupabaseClient.from()
      mockFromChain.single = vi.fn().mockResolvedValueOnce({ 
        data: null, 
        error: { message: 'No rows returned' } 
      })

      const result = await UserService.searchUserID('NonExistent')

      expect(result).toBeNull()
    })
  })

  describe('usersExist', () => {
    it('should return true when users exist', async () => {
      setupMockResponses.usersExistSuccess(true)

      const result = await UserService.usersExist()

      expect(result).toBe(true)
    })

    it('should return false when no users exist', async () => {
      setupMockResponses.usersExistSuccess(false)

      const result = await UserService.usersExist()

      expect(result).toBe(false)
    })

    it('should handle errors gracefully', async () => {
      setupMockResponses.rpcError('Database error')

      const result = await UserService.usersExist()

      expect(result).toBe(false)
    })
  })
})