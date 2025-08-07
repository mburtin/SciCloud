import { test as base } from '@playwright/test';

/**
 * Base fixtures for E2E tests
 * Extend this file with custom fixtures as needed
 */
export const test = base.extend({
  // Add custom fixtures here if needed
  // Example:
  // authenticatedUser: async ({ page }, use) => {
  //   // Setup authenticated user
  //   await page.goto('/login');
  //   // ... authentication logic
  //   await use(page);
  // },
});

export { expect } from '@playwright/test';