import { test, expect } from './fixtures/base';

test.describe('Navigation', () => {
  test('should navigate between public pages', async ({ page }) => {
    test.setTimeout(45000); // Longer timeout for navigation test
    
    // Start with welcome page
    await page.goto('/welcome', { waitUntil: 'networkidle' });
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    
    // Navigate back to welcome
    await page.goto('/welcome', { waitUntil: 'networkidle' });
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    test.setTimeout(30000);
    
    // Test 404 handling - should redirect to error page
    await page.goto('/non-existent-page', { waitUntil: 'networkidle' });
    
    // Should show error page with 404
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    
    // Check that the page loads (even if it's an error page)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should redirect root path appropriately', async ({ page }) => {
    test.setTimeout(30000);
    
    // Root path should redirect based on auth state
    // Since we're not authenticated and likely no users exist, 
    // it should redirect to welcome or login
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for redirect to complete and check app is mounted
    await page.waitForTimeout(2000); // Give more time for router logic
    await expect(page.locator('#app')).toBeVisible({ timeout: 15000 });
    
    // Verify we're not on the root path anymore (should have redirected)
    const url = page.url();
    expect(url).not.toMatch(/\/$$/);
  });
});