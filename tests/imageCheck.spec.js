// broken-images.spec.js

import { test, expect } from '@playwright/test';

// Define the URL to check here
const TARGET_URL = 'https://feit.com/'; 

test('Should not have any broken images', async ({ page, request }) => {
  // 1. Array to store all images that fail to load
  const brokenImages = [];

  // 2. Intercept network requests and listen for failures
  page.on('response', async response => {
    const url = response.url();
    const status = response.status();
    const contentType = response.headers()['content-type'];

    // Check if the request is for an image and the status is an error (4xx or 5xx)
    const isImage = contentType && (contentType.startsWith('image/') || contentType.startsWith('application/octet-stream'));
    const isErrorStatus = status >= 400;

    if (isImage && isErrorStatus) {
      // Add a potential broken image URL and its status to the list
      brokenImages.push({ url, status });
    }
  });

  // 3. Navigate to the target page
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  // 4. Wait for the network to be idle to ensure all image attempts have completed.
  await page.waitForLoadState('networkidle');

  // 5. Final check: Assert that the list of broken images is empty
  if (brokenImages.length > 0) {
    console.log(`\n❌ Found ${brokenImages.length} broken image(s) on ${TARGET_URL}:`);
    brokenImages.forEach(img => {
      console.log(` - Status ${img.status}: ${img.url}`);
    });
    // Fail the test if broken images are found
    expect(brokenImages.length).toBe(0);
  } else {
    console.log(`✅ No broken images found on ${TARGET_URL}.`);
  }
});