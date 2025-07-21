import baseConfig from '../../eslint.config.js'
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import parser from "vue-eslint-parser";

export default [
  ...baseConfig,

  // Configuration for Vue.js files
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: parser,
      parserOptions: {
        ecmaVersion: 2023,
        sourceType: "module",
        parser: "@typescript-eslint/parser", // For TypeScript support
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Specific rules
      "vue/multi-word-component-names": "warn",
      "vue/component-definition-name-casing": ["error", "PascalCase"],
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/prop-name-casing": ["error", "camelCase"],
      "vue/attribute-hyphenation": ["error", "always"],
      "vue/v-on-event-hyphenation": ["error", "always"],
      "vue/html-indent": ["error", 2],
      "vue/html-quotes": ["error", "double"],
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "never",
            normal: "always",
            component: "always",
          },
          svg: "always",
          math: "always",
        },
      ],
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: { max: 3 },
          multiline: { max: 1 },
        },
      ],
      "vue/require-default-prop": "error",
      "vue/require-prop-types": "error",
      "vue/no-unused-vars": "warn",
      "vue/no-unused-components": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".git/**",
      "coverage/**",
      "eslint.config.js",
      "*.config.js",
      "*.config.ts",
    ],
  },
];
