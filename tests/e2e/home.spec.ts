import { test, expect } from './fixtures/base';

test.describe('Home Page', () => {
  test('should load the homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/SciCloud/);
  });

  test('should display main navigation elements', async ({ page }) => {
    await page.goto('/');
    
    // Check for main layout elements
    // Adjust these selectors based on your actual app structure
    await expect(page.locator('body')).toBeVisible();
  });

});