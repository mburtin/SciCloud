import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2023,
      },
      ecmaVersion: 2023,
      sourceType: "module",
    },
    rules: {
      // Basic rules for JavaScript/TypeScript
      "no-unused-vars": "warn",
      "no-undef": "error",
      "prefer-const": "warn",
      "no-var": "error",
      quotes: ["error", "single"],
      indent: ["error", 2],
      "no-console": "warn",
      eqeqeq: "error",
      curly: "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      ".git/**",
      "coverage/**",
      "**/eslint.config.js",
    ],
  },
];
