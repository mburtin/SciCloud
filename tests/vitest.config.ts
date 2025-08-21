/// <reference types="vitest" />
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': resolve(__dirname, '../apps/web/src'),
      '@/test': resolve(__dirname, './web'),
    },
  },

  test: {
    // Global configuration
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./web/setup.ts'],

    // Coverage v8
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: '../coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts',
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },

    include: [
      './web/**/*.{test,spec}.{js,ts,tsx}',
    ],

    exclude: [
      'node_modules/',
      'dist/',
    ],

    testTimeout: 10000,

    deps: {
      optimizer: {
        web: {
          include: ['@vue', '@vueuse']
        }
      }
    },
  },
})
