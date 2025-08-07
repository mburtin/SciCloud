import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import globals from 'globals';

export default [
  js.configs.recommended,
  
  // Supabase Edge Functions configuration (Deno environment)
  {
    files: ['apps/supabase/functions/**/*.{ts,js}'],
    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.browser,
        Deno: 'readonly',
        console: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-console': 'off', // Allow console.log in Edge Functions for debugging
      'no-undef': 'error'
    }
  },
  
  // JavaScript configuration
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn'
    }
  },
  
  // TypeScript configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      globals: {
        ...globals.browser,
        ...globals.node,
        confirm: 'readonly',
        requestAnimationFrame: 'readonly'
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'warn',
      'no-console': 'warn'
    }
  },
  
  // Test files configuration - allow 'any' type for mocking and test utilities
  {
    files: ['tests/**/*.{ts,tsx}', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/build/**',
      '.git/**',
      'coverage/**',
      '**/*.vue',
      '**/*.d.ts'
    ]
  }
];