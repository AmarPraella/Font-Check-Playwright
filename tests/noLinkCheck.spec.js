import { test, expect } from '@playwright/test';

// ⚠️ CHANGE THIS URL to the website you want to check
const TARGET_URL = 'https://xeroshoes.com/?country=US';

test(`Should not have any links ending in /# on ${TARGET_URL}`, async ({ page }) => {
    // 1. Navigate to the target page and wait until the document is loaded
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

    // 2. Locate all anchor elements (links) on the page
    const allLinks = page.locator('a');

    // 3. Extract the 'href' attribute from every link on the page
    // Playwright's evaluateAll is used for bulk operations in the browser context
    const allHrefs = await allLinks.evaluateAll(list => 
        list.map(element => element.href)
    );

    // 4. Filter the list to find links that end with '/#'
    const badLinks = allHrefs.filter(href => {
        // Check for the pattern, ensuring we only check non-empty strings
        if (typeof href === 'string' && href.length > 0) {
            // Use .endsWith() for a clean check
            return href.endsWith('/#');
        }
        return false;
    });
    
    // 5. Assertion and Reporting
    if (badLinks.length > 0) {
        console.log(`\n❌ Found ${badLinks.length} link(s) ending in '/#' on ${TARGET_URL}:`);
        badLinks.forEach(link => {
            console.log(` - ${link}`);
        });
        // Fail the test if any bad links are found
        expect(badLinks, `Found ${badLinks.length} links ending in '/#'. See console output for details.`).toHaveLength(0);
    } else {
        console.log(`✅ No links found ending in '/#' on ${TARGET_URL}.`);
    }
});