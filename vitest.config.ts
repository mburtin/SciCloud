/// <reference types="vitest" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, './apps/web/src'),
      '@/test': resolve(__dirname, './tests/web'),
    },
  },
  
  test: {
    // Configuration globale des tests
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/web/setup.ts'],
    
    // Coverage avec v8 (plus rapide que c8)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'dist/',
        'coverage/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/index.ts', // Fichiers d'export
      ],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },

    // Organisation des tests
    include: [
      './tests/web/**/*.{test,spec}.{js,ts,tsx}',
    ],
    
    exclude: [
      'node_modules/',
      'dist/',
    ],

    // Timeout pour les tests (2 secondes par défaut)
    testTimeout: 10000,
    
    // Configuration pour le rendu des composants Vue
    deps: {
      optimizer: {
        web: {
          include: ['@vue', '@vueuse']
        }
      }
    },
  },
})