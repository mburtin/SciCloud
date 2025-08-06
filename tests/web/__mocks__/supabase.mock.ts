/**
 * Simplified Supabase mock for testing
 * Focuses on direct client mocking for unit tests
 */

import { vi } from 'vitest'
import type { User, UserRole } from '@/types/supabase'

// Mock user data for testing
export const mockUsers: User[] = [
  {
    id: 'mock-admin-1',
    email: 'admin@example.com',
    phone: null,
    first_name: 'John',
    last_name: 'Doe',
    biography: 'Test admin user',
    location: 'Test City',
    full_address: '123 Test Street',
    avatar_url: null,
    role: 'admin' as UserRole,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 'mock-user-1',
    email: 'user@example.com',
    phone: '+1234567890',
    first_name: 'Jane',
    last_name: 'Smith',
    biography: 'Test regular user',
    location: 'Test Town',
    full_address: '456 Test Avenue',
    avatar_url: 'https://example.com/avatar.jpg',
    role: 'user' as UserRole,
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z'
  }
]

// Mock data store for stateful testing
let mockDataStore = {
  users: [...mockUsers],
  authUser: null as any,
  currentSession: null as any
}

// Mock response helpers
export const createMockResponse = (data: any = null, error: any = null) => ({
  data,
  error,
  count: null,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
})

export const createMockAuthResponse = (user: any = null, error: any = null) => ({
  data: { user, session: user ? { access_token: 'mock-token' } : null },
  error
})

// Create comprehensive Supabase client mock
export const createMockSupabaseClient = () => {
  const mockClient = {
    // Auth methods
    auth: {
      getUser: vi.fn().mockImplementation(async () => {
        return createMockAuthResponse(mockDataStore.authUser)
      }),
      
      signInWithPassword: vi.fn().mockImplementation(async ({ email, password }) => {
        if (email && password) {
          const user = { id: 'auth-user-1', email }
          mockDataStore.authUser = user
          return createMockAuthResponse(user)
        }
        return createMockAuthResponse(null, { message: 'Invalid credentials' })
      }),
      
      updateUser: vi.fn().mockImplementation(async (updates) => {
        if (!mockDataStore.authUser) {
          return createMockAuthResponse(null, { message: 'Auth session missing!' })
        }
        Object.assign(mockDataStore.authUser, updates)
        return createMockAuthResponse(mockDataStore.authUser)
      }),
      
      admin: {
        createUser: vi.fn().mockImplementation(async (userData) => {
          const user = {
            id: `mock-user-${Date.now()}`,
            email: userData.email,
            user_metadata: userData.user_metadata || {}
          }
          return createMockAuthResponse(user)
        }),
        
        deleteUser: vi.fn().mockImplementation(async () => {
          return createMockResponse(null)
        })
      }
    },

    // Database query builder methods
    from: vi.fn().mockImplementation(() => {
      const chainMethods = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        like: vi.fn().mockReturnThis(),
        ilike: vi.fn().mockReturnThis(),
        is: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
        contains: vi.fn().mockReturnThis(),
        containedBy: vi.fn().mockReturnThis(),
        rangeGt: vi.fn().mockReturnThis(),
        rangeGte: vi.fn().mockReturnThis(),
        rangeLt: vi.fn().mockReturnThis(),
        rangeLte: vi.fn().mockReturnThis(),
        rangeAdjacent: vi.fn().mockReturnThis(),
        overlaps: vi.fn().mockReturnThis(),
        textSearch: vi.fn().mockReturnThis(),
        match: vi.fn().mockReturnThis(),
        not: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        filter: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(createMockResponse(null)),
        maybeSingle: vi.fn().mockResolvedValue(createMockResponse(null)),
      }
      return chainMethods
    }),

    // RPC (Remote Procedure Call) methods
    rpc: vi.fn().mockImplementation(async (functionName, params) => {
      switch (functionName) {
        case 'get_user_profile':
          const user = mockDataStore.users.find(u => u.id === params?.user_id)
          return createMockResponse(user, user ? null : { message: 'User not found' })
          
        case 'get_all_user_profiles':
          return createMockResponse(mockDataStore.users)
          
        case 'users_exist':
          return createMockResponse(mockDataStore.users.length > 0)
          
        case 'admin_update_user_role':
          const targetUser = mockDataStore.users.find(u => u.id === params?.target_user_id)
          if (targetUser) {
            targetUser.role = params?.new_role
            return createMockResponse(null)
          }
          return createMockResponse(null, { message: 'User not found' })
          
        default:
          return createMockResponse(null, { message: 'Function not found' })
      }
    }),

    // Edge Functions
    functions: {
      invoke: vi.fn().mockImplementation(async (functionName, { body }) => {
        switch (functionName) {
          case 'create-user':
            const newUser = {
              id: `mock-user-${Date.now()}`,
              email: body.email,
              phone: null,
              ...body,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
            mockDataStore.users.push(newUser)
            return createMockResponse({ success: true, data: newUser })
            
          case 'delete-user':
            const userIndex = mockDataStore.users.findIndex(u => u.id === body.userId)
            if (userIndex >= 0) {
              mockDataStore.users.splice(userIndex, 1)
              return createMockResponse({ success: true })
            }
            return createMockResponse({ success: false, error: 'User not found' })
            
          default:
            return createMockResponse({ success: false, error: 'Function not found' })
        }
      })
    }
  }

  return mockClient
}

// Default mock client instance
export const mockSupabaseClient = createMockSupabaseClient()

// Helper functions for test data management
export const resetMockData = () => {
  mockDataStore = {
    users: [...mockUsers],
    authUser: null,
    currentSession: null
  }
}

export const setMockAuthUser = (user: any) => {
  mockDataStore.authUser = user
}

export const getMockUsers = () => mockDataStore.users

export const addMockUser = (user: User) => {
  mockDataStore.users.push(user)
}

export const removeMockUser = (userId: string) => {
  const index = mockDataStore.users.findIndex(u => u.id === userId)
  if (index >= 0) {
    mockDataStore.users.splice(index, 1)
  }
}

// Mock response setup helpers for testing specific scenarios
export const setupMockResponses = {
  // RPC success responses
  getUserSuccess: (user: User) => {
    mockSupabaseClient.rpc.mockResolvedValueOnce(createMockResponse(user))
  },
  
  getAllUsersSuccess: (users: User[]) => {
    mockSupabaseClient.rpc.mockResolvedValueOnce(createMockResponse(users))
  },
  
  usersExistSuccess: (exists: boolean) => {
    mockSupabaseClient.rpc.mockResolvedValueOnce(createMockResponse(exists))
  },

  // Edge Function success responses
  createUserSuccess: (userData: any) => {
    mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
      createMockResponse({ success: true, data: userData })
    )
  },

  deleteUserSuccess: () => {
    mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
      createMockResponse({ success: true })
    )
  },

  // Database operation success responses
  updateProfileSuccess: () => {
    const chain = mockSupabaseClient.from()
    chain.single.mockResolvedValueOnce(createMockResponse(null))
  },

  // Error responses
  rpcError: (message: string) => {
    mockSupabaseClient.rpc.mockResolvedValueOnce(
      createMockResponse(null, { message })
    )
  },

  edgeFunctionError: (message: string) => {
    mockSupabaseClient.functions.invoke.mockResolvedValueOnce(
      createMockResponse({ success: false, error: message })
    )
  },

  authError: (message: string) => {
    mockSupabaseClient.auth.getUser.mockResolvedValueOnce(
      createMockAuthResponse(null, { message })
    )
  },

  databaseError: (message: string) => {
    const chain = mockSupabaseClient.from()
    chain.single.mockResolvedValueOnce(createMockResponse(null, { message }))
  }
}

// Test lifecycle helpers
export const resetSupabaseMocks = () => {
  resetMockData()
  vi.clearAllMocks()
}

// Export for manual mocking
export default mockSupabaseClient