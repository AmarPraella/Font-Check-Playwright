// Import the necessary modules from Playwright test
const { test, expect } = require('@playwright/test');

// Define a test suite (optional, but good practice)
test.describe('My Practice Suite', () => {

  // Define a test case
  test('should navigate to example.com and check title', async ({ page }) => {
    // 1. Navigate to the page
    await page.goto('https://example.com');

    // 2. Create a locator for the heading
    const heading = page.locator('h1');

    // 3. Assert that the heading is visible
    await expect(heading).toBeVisible();

    // 4. Assert that the page has the correct title
    // Using a regular expression to be flexible
    await expect(page).toHaveTitle(/Example Domain/);
  });

}); // End of test suite