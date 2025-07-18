// checkText.spec.js
// Note the file extension '.spec.js' - Playwright Test runner looks for these by default.

// Import the necessary functions from Playwright Test
const { test, expect } = require('@playwright/test');

// --- Test Configuration ---
// You can place these inside the test or keep them here for easy modification
const targetUrl = 'https://rel.net/'; // <--- CHANGE THIS to the website you want to check
const textBlockToVerify = `If you're seeking deep, immersive bass for your home theater, tight and precise bass for music, or a versatile subwoofer that excels in both, our comparison tool is designed to help you find the perfect subwoofer to meet your specific needs.`; // <--- CHANGE THIS to the exact text you want to find

// --- Test Suite ---
// You can optionally wrap tests in describe blocks for better organization
test.describe('Website Text Verification', () => {

    // --- Test Case ---
    test(`should find the exact text block "${textBlockToVerify}" on ${targetUrl}`, async ({ page }) => {
        // The 'page' fixture is automatically provided by the test runner

        // 1. Navigate to the page
        console.log(`Navigating to ${targetUrl}...`);
        // Increased timeout and using 'domcontentloaded' or 'load' might be slightly faster
        // 'networkidle' is safer for apps with lots of background requests.
        await test.step('Navigate to URL', async () => {
            await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
            console.log("Navigation successful.");
        });

        // 2. Define the locator for the exact text
        // Using ':text-is()' for an exact, case-sensitive match.
        const textLocator = page.locator(`:text-is("${textBlockToVerify}")`);
        console.log(`Locator created for exact text: ":text-is(\\"${textBlockToVerify}\\")"`);

        // 3. Assert that the element with the exact text is visible
        //    'expect' handles waiting and retrying automatically based on Playwright config.
        //    If the element isn't found and visible within the timeout, the test fails here.
        console.log("Asserting that the text block is visible...");
        await test.step('Verify text visibility', async () => {
            await expect(textLocator, `Expected text "${textBlockToVerify}" to be visible`).toBeVisible();
            // You could also add checks like:
            // await expect(textLocator).toHaveCount(1); // If you expect exactly one instance
            // await expect(textLocator.first()).toHaveText(textBlockToVerify); // Verify text content explicitly
        });

        console.log("Assertion successful: Text block is visible.");
        // No need to return true/false; if expect doesn't throw, the test passes.

    }); // End of test case

    // You could add more related test cases within this describe block
    // For example, a test to ensure certain text *doesn't* exist:
    /*
    test('should NOT find non-existent text', async ({ page }) => {
        const nonExistentText = "This text definitely should not be here xyz123";
        await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
        const locator = page.locator(`:text-is("${nonExistentText}")`);
        await expect(locator).not.toBeVisible();
        // Or check count:
        // await expect(locator).toHaveCount(0);
    });
    */

}); // End of describe block