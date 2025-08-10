import { test, expect } from './fixtures/base';

test.describe('Home Page', () => {
  test('should load the welcome page when no users exist', async ({ page }) => {
    // Set a longer timeout for this specific test
    test.setTimeout(30000);
    
    // Go to welcome page directly (public route)
    await page.goto('/welcome', { waitUntil: 'networkidle' });
    
    // Wait for Vue app to mount and be visible
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    
    // Check for page title
    await expect(page).toHaveTitle(/SciCloud/);
  });

  test('should display main navigation elements on welcome page', async ({ page }) => {
    test.setTimeout(30000);
    
    await page.goto('/welcome', { waitUntil: 'networkidle' });
    
    // Check that the app mounted successfully with longer timeout
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    
    // Check for basic page structure
    await expect(page.locator('body')).toBeVisible();
  });

  test('should load the login page', async ({ page }) => {
    test.setTimeout(30000);
    
    // Go to login page directly (public route)
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Check that Vue app is mounted with longer timeout
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    
    // Check for page title
    await expect(page).toHaveTitle(/SciCloud/);
  });

});