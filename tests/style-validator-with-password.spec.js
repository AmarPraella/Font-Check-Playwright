// Import necessary functions from Playwright Test
// 'test' is used to define a test case.
// 'expect' is used to make assertions about the results.
const { test, expect } = require('@playwright/test');
const fs = require('fs'); // Node.js 'fs' module for file system operations (e.g., reading files).
const path = require('path'); // Node.js 'path' module for handling and transforming file paths.

// --- Test Configuration ---

// == Target URLs ==
// Read a comma-separated list of URLs from an environment variable named 'TARGET_URLS'.
// If 'TARGET_URLS' is not set, it falls back to 'TARGET_URL' for a single link.
// If neither is set, it uses "https://omaspride.com/" as the default.
const urlsInput = process.env.TARGET_URLS || process.env.TARGET_URL || "https://randys-worldwide.myshopify.com/";
// The input string is split by commas to create an array of URLs.
// .trim() removes any extra whitespace, and .filter() removes any empty entries.
const TARGET_URLS = urlsInput.split(',').map(url => url.trim()).filter(url => url.length > 0);

// == Login Credentials ==
const LOGIN_PASSWORD = "praella"; // The password to use for login.
const LOGIN_BUTTON_TEXT = "Login using password"; // Text of the button to open the login modal.
const PASSWORD_INPUT_NAME = "password"; // Name attribute of the password input field.
// const SUBMIT_BUTTON_SELECTOR = 'input[type="submit"].btn.btn-primary'; // Selector for the submit button.

// == Element-Specific Style Expectations ==
// This object acts as the single source of truth for your design specification.
// Each key is a lowercase HTML tag (e.g., 'h1', 'p').
// Each value is an object defining the expected styles for that tag.
// The script uses arrays of strings for each property to allow for multiple valid styles.
// Line heights are converted to PX values based on the provided percentages and font sizes.
// Font weights are converted to numeric values (e.g., 900 for ExtraBold).
// New properties: 'color', 'fontStyle', 'textTransform', 'letterSpacing'
let STYLE_EXPECTATIONS;
const defaultExpectations = {
    'h1': { // Combines "Desktop/H1 Display" and "Desktop/H1"
        color: ["rgb(35, 31, 32)"], // Converted from #231F20
        fontFamily: ["Saira"],
        fontSize: ["72px", "50px"],
        fontStyle: ["italic"],
        fontWeight: ["900"],
        lineHeight: ["79.2px", "55px"], // 72*1.10=79.2, 50*1.10=55
        textTransform: ["uppercase"],
        letterSpacing: null // Not specified for H1
    },
    'h2': { // "Desktop/H2"
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Saira"],
        fontSize: ["36px"],
        fontStyle: ["italic"],
        fontWeight: ["900"],
        lineHeight: ["39.6px"], // 36*1.10=39.6
        textTransform: ["uppercase"],
        letterSpacing: null
    },
    'h3': { // "Desktop/H3"
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Saira"],
        fontSize: ["30px"],
        fontStyle: ["italic"],
        fontWeight: ["900"],
        lineHeight: ["33px"], // 30*1.10=33
        textTransform: ["uppercase"],
        letterSpacing: null
    },
    'h4': { // "Desktop/H4"
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Saira"],
        fontSize: ["26px"],
        fontStyle: ["italic"],
        fontWeight: ["900"],
        lineHeight: ["28.6px"], // 26*1.10=28.6
        textTransform: ["uppercase"],
        letterSpacing: null
    },
    'h5': { // "Desktop/H5"
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Inter"],
        fontSize: ["20px"],
        fontStyle: ["normal"],
        fontWeight: ["700"],
        lineHeight: ["26px"], // 20*1.30=26
        textTransform: ["none"], // Default to none if not uppercase
        letterSpacing: null
    },
    'h6': { // "Desktop/H6"
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Inter"],
        fontSize: ["15px"],
        fontStyle: ["normal"],
        fontWeight: ["500"],
        lineHeight: ["18px"], // 15*1.20=18
        letterSpacing: ["0.6px"],
        textTransform: ["uppercase"]
    },
    'p': { // Combines "Desktop/Paragraph Large" and "Desktop/Paragraph"
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Inter"],
        fontSize: ["17px", "15px"],
        fontStyle: ["normal"],
        fontWeight: ["400"],
        lineHeight: ["27.2px", "24px"], // 17*1.60=27.2, 15*1.60=24
        textTransform: ["none"],
        letterSpacing: null
    },
    // The following are typically generic elements that might adopt the styles above based on class.
    // If they have explicit styles not covered by h1-h6, p, a, button, you may need to add specific selectors.
    /*
    'a': { // Adapted for links, assuming Inter is common
        color: ["rgb(35, 31, 32)"], // Often inherit, but can be explicit
        fontFamily: ["Inter"],
        fontSize: ["15px"],
        fontStyle: ["normal"],
        lineHeight: ["24px"],
        fontWeight: ["400"],
        textTransform: ["none"],
        letterSpacing: null
    },
    'button': { // Example: using 14px as a common button size from previous config
        color: ["rgb(35, 31, 32)"], // Often explicit for buttons
        fontFamily: ["Inter"],
        fontSize: ["14px"],
        fontStyle: ["normal"],
        lineHeight: ["20px"],
        fontWeight: ["500"], // Medium
        textTransform: ["none"],
        letterSpacing: null
    },
    // "Desktop/Subtitle" would typically be a span or div with a specific class.
    // To validate it, you would need to add its specific selector to ELEMENT_SELECTOR
    // and create a new entry for that selector here, or rely on 'span' if it's applied there.
    'span': {
        // Example for 'Desktop/Subtitle' if applied directly to span
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Inter"],
        fontSize: ["14px"],
        fontStyle: ["normal"],
        lineHeight: ["16.8px"], // 14*1.20=16.8
        fontWeight: ["700"], // Bold
        letterSpacing: ["0.56px"],
        textTransform: ["uppercase"]
    },
    'div': {
        // Divs are structural; setting general font rules might cause many failures.
        // It's often best to keep these null or very generic unless specific divs always have a style.
        color: null,
        fontFamily: null,
        fontSize: null,
        fontStyle: null,
        lineHeight: null,
        fontWeight: null,
        textTransform: null,
        letterSpacing: null
    },
    'li': { // Assuming list items might default to Inter paragraph styles
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Inter"],
        fontSize: ["15px"],
        fontStyle: ["normal"],
        lineHeight: ["24px"],
        fontWeight: ["400"],
        textTransform: ["none"],
        letterSpacing: null
    },
    'label': { // Assuming labels might default to Inter paragraph styles
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Inter"],
        fontSize: ["15px"],
        fontStyle: ["normal"],
        lineHeight: ["24px"],
        fontWeight: ["400"],
        textTransform: ["none"],
        letterSpacing: null
    },
    'default': { // Fallback for any other elements not explicitly matched above.
        color: ["rgb(35, 31, 32)"],
        fontFamily: ["Inter"], // Inter seems to be the default body font
        fontSize: ["15px"],
        fontStyle: ["normal"],
        lineHeight: ["24px"],
        fontWeight: ["400"],
        textTransform: ["none"],
        letterSpacing: null
    }
    */
};

// This block determines which style configuration to use.
// It prioritizes environment variables over the hardcoded default.
try {
    if (process.env.STYLE_EXPECTATIONS_JSON) {
        // Priority 1: A JSON string passed directly as an environment variable.
        STYLE_EXPECTATIONS = JSON.parse(process.env.STYLE_EXPECTATIONS_JSON);
        console.log("Loaded style expectations from STYLE_EXPECTATIONS_JSON environment variable.");
    } else if (process.env.STYLE_EXPECTATIONS_PATH) {
        // Priority 2: A file path to a JSON configuration file.
        const filePath = path.resolve(process.env.STYLE_EXPECTATIONS_PATH);
        if (fs.existsSync(filePath)) {
            STYLE_EXPECTATIONS = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            console.log(`Loaded style expectations from file: ${filePath}`);
        } else {
             // If the file path is provided but invalid, warn the user and use defaults.
             console.warn(`Style expectations file not found at path specified by STYLE_EXPECTATIONS_PATH: ${filePath}. Using default expectations.`);
             STYLE_EXPECTATIONS = defaultExpectations;
        }
    }
     else {
        // Priority 3: The hardcoded 'defaultExpectations' object if no environment variables are set.
        console.log("Using default hardcoded style expectations.");
        STYLE_EXPECTATIONS = defaultExpectations;
    }
} catch (error) {
    // If any error occurs (e.g., invalid JSON), fall back to the defaults to prevent crashing.
    console.error("Error loading or parsing style expectations. Using default expectations.", error);
    STYLE_EXPECTATIONS = defaultExpectations;
}


// == Other Config ==
// A CSS selector string to define which elements on the page should be checked.
// Ensure this list covers the tags you've defined in STYLE_EXPECTATIONS.
const ELEMENT_SELECTOR = process.env.ELEMENT_SELECTOR || 'p, span, h1, h2, h3, h4, h5, h6, a, li, button, label, td, th, dd, dt, div';
// The maximum time (in milliseconds) a single test is allowed to run before it's considered failed.
const TEST_TIMEOUT_MS = parseInt(process.env.TEST_TIMEOUT_MS || '120000', 10); // Increased timeout to 120 seconds
// --- End Test Configuration ---

// --- Helper Functions ---

/**
 * Checks if the element's primary font family is in the list of expected fonts.
 * @param {string} computedFontFamily - The full 'font-family' string from the browser's computed style.
 * @param {string[]} expectedFontsArray - The array of acceptable font family names from the configuration.
 * @returns {boolean} True if the font is valid or if the check is skipped.
 */
function checkFontFamily(computedFontFamily, expectedFontsArray) {
    // If the expectation is null or an empty array, skip the check and return true (valid).
    if (!expectedFontsArray || expectedFontsArray.length === 0) return true;
    if (!computedFontFamily) return false;
    // Normalize the browser's output: make lowercase, remove quotes, and split into an array.
    const actualFonts = computedFontFamily.toLowerCase().replace(/["']/g, '').split(',').map(f => f.trim());
    // Normalize the expected values for a consistent, case-insensitive comparison.
    const normalizedExpected = expectedFontsArray.map(f => f.toLowerCase().replace(/["']/g, ''));
    // The check passes if the first font in the browser's list is included in our expected list.
    return actualFonts.length > 0 && normalizedExpected.includes(actualFonts[0]);
}

/**
 * Checks if a computed style value (like fontSize, lineHeight, fontWeight, fontStyle, textTransform, letterSpacing)
 * is in the array of acceptable values.
 * This function also handles the conversion of font-weight keywords to numbers if they are in the expected array.
 * @param {string} computedValue - The style value from the browser's computed style.
 * @param {string[]} expectedValuesArray - The array of acceptable values from the configuration.
 * @returns {boolean} True if the value is valid or if the check is skipped.
 */
function checkStyleAgainstArray(computedValue, expectedValuesArray) {
    // If the expectation is null or an empty array, skip the check and return true (valid).
    if (!expectedValuesArray || expectedValuesArray.length === 0) return true;
    if (!computedValue) return false;

    // Normalize computed value for font weight if it's a keyword
    let normalizedComputed = computedValue;
    const weightMap = {
        'thin': '100', 'hairline': '100', 'extralight': '200', 'ultralight': '200',
        'light': '300', 'normal': '400', 'regular': '400', 'medium': '500',
        'semibold': '600', 'demibold': '600', 'bold': '700', 'extrabold': '800',
        'ultrabold': '800', 'black': '900', 'heavy': '900',
    };
    if (Object.keys(weightMap).includes(computedValue.toLowerCase())) {
        normalizedComputed = weightMap[computedValue.toLowerCase()];
    }

    // The check passes if the browser's computed value exists in our array of expectations.
    return expectedValuesArray.includes(normalizedComputed);
}


// --- Test Case ---
// Groups all test cases in this file under a single suite in the test report.
test.describe('Element-Specific Style Validation Test', () => {
    // Sets a specific timeout for all tests within this 'describe' block.
    test.setTimeout(TEST_TIMEOUT_MS);

    // This loop creates a separate, independent test case for each URL in the TARGET_URLS array.
    for (const targetUrl of TARGET_URLS) {
        test(`should validate styles on ${targetUrl}`, async ({ page }) => {
            // 1. Navigate to the page
            console.log(`[${targetUrl}] Attempting to navigate...`);
            // 'waitUntil: 'load'' waits for all resources (like fonts) to be fully loaded.
            await page.goto(targetUrl, { waitUntil: 'load', timeout: TEST_TIMEOUT_MS - 5000 });
            console.log(`[${targetUrl}] Navigation successful.`);
            // A brief pause to allow for any final, dynamically rendered content.
            await page.waitForTimeout(1500);

            // == Login Flow ==
            console.log(`[${targetUrl}] Checking for login page...`);
            const loginButton = page.locator(`text=${LOGIN_BUTTON_TEXT}`);
            const passwordInput = page.locator(`input[name="${PASSWORD_INPUT_NAME}"]`);

            if (await loginButton.isVisible({ timeout: 5000 })) { // Check if login button is visible within 5 seconds
                console.log(`[${targetUrl}] Login button found. Proceeding with login...`);
                await loginButton.click(); // Click the login button

                // Wait for the modal password input to be ready, potentially increasing timeout
                await passwordInput.waitFor({ state: 'visible', timeout: 10000 }); // Increased wait for modal input

                // Fill the password input
                await passwordInput.fill(LOGIN_PASSWORD);
                console.log(`[${targetUrl}] Password entered. Attempting to submit...`);

                // Instead of clicking the submit button, press 'Enter' on the password field.
                // This is more resilient against elements intercepting clicks.
                await passwordInput.press('Enter');

                // Wait for navigation after login submission. This is crucial.
                await page.waitForLoadState('load'); // Wait for page load
                // Also wait for network to be idle to ensure all redirects/dynamic content after login are done.
                await page.waitForLoadState('networkidle');
                console.log(`[${targetUrl}] Login submitted. Page loaded after login.`);
                // Add a small pause if there are redirects or further dynamic content after login
                await page.waitForTimeout(1000);

            } else {
                console.log(`[${targetUrl}] No login page detected or login button not found.`);
            }
            // == End Login Flow ==


            // 2. Locate all elements on the page that match the selector
            const elements = await page.locator(ELEMENT_SELECTOR).all();
            console.log(`[${targetUrl}] Found ${elements.length} potential elements to analyze.`);

            // 3. Perform Validation for each element
            const mismatchedStyleElements = []; // An array to store any elements that fail validation.
            let checkedCount = 0;

            // Loop through every element found by the selector.
            for (const element of elements) {
                try {
                    // 'element.evaluate' runs code within the browser context for a specific element.
                    // This is efficient because it gets all styles in one browser operation.
                    const details = await element.evaluate(el => {
                        const style = window.getComputedStyle(el);
                        const text = (el.textContent || "").trim();
                        const tagName = el.tagName.toLowerCase();
                        // Basic filtering to skip elements that are likely just for icons.
                        const isLikelyIconElement = tagName === 'i' || el.classList.contains('icon');
                        // Ensures the element contains actual text content, not just whitespace.
                        const hasMeaningfulText = text.length > 0;
                        // Skip the element if it's invisible, has no meaningful text, or is likely an icon.
                        if (!el.checkVisibility() || !hasMeaningfulText || isLikelyIconElement) return null;
                        // If the element is valid, return an object with all its relevant style data.
                        return {
                            color: style.color, // New
                            fontFamily: style.fontFamily,
                            fontSize: style.fontSize,
                            fontStyle: style.fontStyle, // New
                            lineHeight: style.lineHeight,
                            fontWeight: style.fontWeight,
                            textTransform: style.textTransform, // New
                            letterSpacing: style.letterSpacing, // New
                            tagName, textContent: text.substring(0, 80) + (text.length > 80 ? '...' : '')
                        };
                    });

                    // If the evaluate function returned null, skip to the next element.
                    if (details === null) continue;
                    checkedCount++;
                    const { color, fontFamily, fontSize, fontStyle, lineHeight, fontWeight, textTransform, letterSpacing, tagName, textContent } = details;

                    // Find the correct set of rules for this element's tag from our configuration.
                    // If the tag isn't explicitly defined, it uses the 'default' rules.
                    const expectedStyles = STYLE_EXPECTATIONS[tagName] || STYLE_EXPECTATIONS['default'] || {};
                    const mismatches = []; // An array to store specific property failures for this element.

                    // Run the validation for each CSS property using the helper functions.
                    if (!checkStyleAgainstArray(color, expectedStyles.color)) {
                        mismatches.push({ property: 'color', expected: (expectedStyles.color || []).join(' or '), found: color });
                    }
                    if (!checkFontFamily(fontFamily, expectedStyles.fontFamily)) {
                        mismatches.push({ property: 'font-family', expected: (expectedStyles.fontFamily || []).join(' or '), found: fontFamily });
                    }
                    if (!checkStyleAgainstArray(fontSize, expectedStyles.fontSize)) {
                        mismatches.push({ property: 'font-size', expected: (expectedStyles.fontSize || []).join(' or '), found: fontSize });
                    }
                    if (!checkStyleAgainstArray(fontStyle, expectedStyles.fontStyle)) {
                        mismatches.push({ property: 'font-style', expected: (expectedStyles.fontStyle || []).join(' or '), found: fontStyle });
                    }
                    if (!checkStyleAgainstArray(lineHeight, expectedStyles.lineHeight)) {
                        mismatches.push({ property: 'line-height', expected: (expectedStyles.lineHeight || []).join(' or '), found: lineHeight });
                    }
                    if (!checkStyleAgainstArray(fontWeight, expectedStyles.fontWeight)) {
                        mismatches.push({ property: 'font-weight', expected: (expectedStyles.fontWeight || []).join(' or '), found: fontWeight });
                    }
                    if (!checkStyleAgainstArray(textTransform, expectedStyles.textTransform)) {
                        mismatches.push({ property: 'text-transform', expected: (expectedStyles.textTransform || []).join(' or '), found: textTransform });
                    }
                    if (!checkStyleAgainstArray(letterSpacing, expectedStyles.letterSpacing)) {
                        mismatches.push({ property: 'letter-spacing', expected: (expectedStyles.letterSpacing || []).join(' or '), found: letterSpacing });
                    }

                    // If any of the checks failed, add the element and its specific errors to the main report list.
                    if (mismatches.length > 0) {
                        mismatchedStyleElements.push({ tag: tagName, text: textContent, mismatches });
                    }
                } catch (e) {
                     // Catch errors, such as the page closing unexpectedly due to a timeout.
                     if (e.message.includes('Target page, context or browser has been closed')) {
                        console.warn(`Skipping element due to closed target: ${e.message}`);
                        break; // Stop checking elements on this page if the page is gone.
                    }
                    console.error(` Error checking element: ${e.message}`);
                }
            }
            console.log(`\n[${targetUrl}] Analyzed ${checkedCount} visible elements with text content.`);

            // 4. Report Results
            // This is the final assertion. The test will only pass if the 'mismatchedStyleElements' array is empty.
            // If the array is not empty, the test fails, and the second argument (the detailed report message) is displayed.
            expect(mismatchedStyleElements, `[${targetUrl}] Style validation failed. Found ${mismatchedStyleElements.length} elements with mismatched styles:\n${JSON.stringify(mismatchedStyleElements, null, 2)}`).toEqual([]);
            // This success message will only be logged if the assertion above passes.
            if (mismatchedStyleElements.length === 0) {
                 console.log(`✅ [${targetUrl}] Style validation successful!`);
            }
        });
    }
});
