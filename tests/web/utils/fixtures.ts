/**
 * Test fixtures
 * Predefined test data for consistent testing
 */

import type { UserRole } from '@/types/supabase'
import { createMockUser } from './test-utils'

// Sample users for testing
export const fixtures = {
  users: {
    admin: createMockUser({
      id: 'admin-user-1',
      first_name: 'Admin',
      last_name: 'User',
      biography: 'Administrator account',
      role: 'admin' as UserRole,
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z'
    }),

    regularUser: createMockUser({
      id: 'regular-user-1',
      first_name: 'Regular',
      last_name: 'User',
      biography: 'Regular user account',
      role: 'user' as UserRole,
      created_at: '2024-01-02T00:00:00.000Z',
      updated_at: '2024-01-02T00:00:00.000Z'
    }),

    activeUser: createMockUser({
      id: 'active-user-1',
      first_name: 'Active',
      last_name: 'User',
      biography: 'Status: active. User is currently active',
      role: 'user' as UserRole,
      updated_at: new Date().toISOString() // Recently active
    }),

    inactiveUser: createMockUser({
      id: 'inactive-user-1',
      first_name: 'Inactive',
      last_name: 'User',
      biography: 'Status: inactive. User has been inactive',
      role: 'user' as UserRole,
      updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
    })
  },

  // Multiple users for testing collections
  usersList: [
    createMockUser({
      id: 'user-1',
      first_name: 'Alice',
      last_name: 'Johnson',
      role: 'admin' as UserRole,
      updated_at: new Date().toISOString() // Active
    }),
    createMockUser({
      id: 'user-2', 
      first_name: 'Bob',
      last_name: 'Smith',
      role: 'user' as UserRole,
      updated_at: new Date().toISOString() // Active
    }),
    createMockUser({
      id: 'user-3',
      first_name: 'Carol',
      last_name: 'Brown',
      role: 'user' as UserRole,
      updated_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // Inactive
    })
  ],

  // User creation data
  createUserData: {
    valid: {
      email: 'newuser@example.com',
      password: 'securepassword123',
      first_name: 'New',
      last_name: 'User',
      biography: 'New user biography',
      location: 'New City',
      full_address: '789 New Street',
      avatar_url: 'https://example.com/avatar.jpg',
      role: 'user' as UserRole
    },

    minimal: {
      email: 'minimal@example.com',
      password: 'password123',
      first_name: 'Minimal',
      last_name: 'User'
    },

    admin: {
      email: 'admin@example.com',
      password: 'adminpassword123',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin' as UserRole
    }
  },

  // Profile update data
  profileUpdates: {
    basic: {
      first_name: 'Updated',
      last_name: 'Name',
      biography: 'Updated biography'
    },

    roleUpdate: {
      role: 'admin' as UserRole
    },

    complete: {
      first_name: 'Complete',
      last_name: 'Update',
      biography: 'Completely updated biography',
      location: 'Updated City',
      full_address: '456 Updated Avenue',
      avatar_url: 'https://example.com/new-avatar.jpg',
      role: 'admin' as UserRole
    }
  },

  // Error messages for testing
  errors: {
    networkError: 'Network connection failed',
    authError: 'Authentication failed',
    validationError: 'Validation failed',
    permissionError: 'Permission denied',
    notFoundError: 'User not found',
    serverError: 'Internal server error'
  },

  // Environment variables for Edge Function tests
  envVars: {
    development: {
      SUPABASE_URL: 'http://localhost:54321',
      SUPABASE_ANON_KEY: 'mock-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'mock-service-role-key'
    },

    production: {
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_ANON_KEY: 'prod-anon-key',
      SUPABASE_SERVICE_ROLE_KEY: 'prod-service-role-key'
    }
  },

  // Request data for Edge Functions
  edgeFunctionRequests: {
    createUser: {
      valid: {
        email: 'test@example.com',
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        role: 'user' as UserRole
      },

      firstUser: {
        email: 'admin@example.com',
        password: 'adminpassword123',
        first_name: 'First',
        last_name: 'Admin'
      },

      invalid: {
        email: 'test@example.com',
        // Missing required fields
      }
    },

    deleteUser: {
      valid: {
        userId: 'user-to-delete'
      },

      invalid: {
        // Missing userId
      }
    }
  }
}

// Export individual fixtures for convenience
export const {
  users,
  usersList,
  createUserData,
  profileUpdates,
  errors,
  envVars,
  edgeFunctionRequests
} = fixtures