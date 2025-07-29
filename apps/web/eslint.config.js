import baseConfig from '../../eslint.config.js';
import pluginVue from 'eslint-plugin-vue';
import tsparser from '@typescript-eslint/parser';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default [
  // Extend base configuration
  ...baseConfig,
  
  // Vue.js specific configuration
  ...pluginVue.configs['flat/recommended'],
  
  // Override for TypeScript in browser environment
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2023
      }
    },
    rules: {
      // Allow console.log in development
      'no-console': 'off'
    }
  },
  
  // Configuration for Vue files
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsparser,
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      globals: {
        ...globals.browser,
        ...globals.es2023
      }
    },
    rules: {
      // Vue-specific rules (simple ones to start)
      'vue/multi-word-component-names': 'warn',
      'vue/no-unused-vars': 'warn',
      'vue/no-unused-components': 'warn',
      // Allow console.log in development
      'no-console': 'off'
    }
  },
  
  {
    ignores: [
      'src/components/ui/**'
    ]
  }
];