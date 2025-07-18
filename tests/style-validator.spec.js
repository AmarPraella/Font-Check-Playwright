// Import necessary functions from Playwright Test
const { test, expect } = require('@playwright/test');
const fs = require('fs'); // Require file system module if loading expectations from file
const path = require('path'); // Require path module

// --- Test Configuration ---

// == Target URLs ==
// Read a comma-separated list of URLs from an environment variable (TARGET_URLS).
const urlsInput = process.env.TARGET_URLS || process.env.TARGET_URL || "https://omaspride.com/";
const TARGET_URLS = urlsInput.split(',').map(url => url.trim()).filter(url => url.length > 0);


// == Element-Specific Style Expectations ==
// This is the SINGLE SOURCE OF TRUTH for your design specification.
// This configuration now uses arrays of acceptable values.
let STYLE_EXPECTATIONS;
const defaultExpectations = {
    'h1': {
        fontFamily: ["Be Vietnam Pro"],
        fontSize: ["55px"],
        lineHeight: ["63px"], // 55px * 1.15
        fontWeight: ["800"]  // ExtraBold
    },
    'h2': {
        fontFamily: ["Be Vietnam Pro"],
        fontSize: ["42px"],
        lineHeight: ["48px"], // 42px * 1.15
        fontWeight: ["800"]  // ExtraBold
    },
    'h3': {
        fontFamily: ["Be Vietnam Pro"],
        fontSize: ["32px"],
        lineHeight: ["38px"], // 32px * 1.20
        fontWeight: ["800"]  // ExtraBold
    },
    'h4': {
        fontFamily: ["Be Vietnam Pro"],
        fontSize: ["24px"],
        lineHeight: ["29px"], // 24px * 1.20
        fontWeight: ["800"]  // ExtraBold
    },
    'h5': {
        fontFamily: ["Be Vietnam Pro"],
        fontSize: ["20px"],
        lineHeight: ["26px"], // 20px * 1.30
        fontWeight: ["700"]  // Bold
    },
    'h6': {
        fontFamily: ["Lexend"],
        fontSize: ["16px"],
        lineHeight: ["24px"], // 16px * 1.50
        fontWeight: ["500"]  // Medium
    },
    'p': {
        fontFamily: ["Lexend"],
        fontSize: ["18px", "16px", "14px"],
        lineHeight: ["29px", "26px", "22px"], // 160% of each font size
        fontWeight: ["300"]  // Light
    },
    'a': {
        fontFamily: ["Lexend"], // Corrected case
        fontSize: ["15px"],
        lineHeight: ["24px"],
        fontWeight: ["500,400"]
    },
    'button': {
        fontFamily: ["Be Vietnam Pro"], // Corrected case
        fontSize: ["14px"],
        lineHeight: ["20px"],
        fontWeight: ["600"]
    },
    'span': {
        fontFamily: null,
        fontSize: null,
        lineHeight: null,
        fontWeight: null
    },
    'div': {
        fontFamily: null,
        fontSize: null,
        lineHeight: null,
        fontWeight: null
    },
    'default': { // Fallback for other elements
        fontFamily: ["Lexend"],
        fontSize: ["18px", "16px", "14px"],
        lineHeight: ["29px", "26px", "22px"], // 160% of each font size
        fontWeight: ["300"]  // Light
    }
};

try {
    if (process.env.STYLE_EXPECTATIONS_JSON) {
        STYLE_EXPECTATIONS = JSON.parse(process.env.STYLE_EXPECTATIONS_JSON);
        console.log("Loaded style expectations from STYLE_EXPECTATIONS_JSON environment variable.");
    } else if (process.env.STYLE_EXPECTATIONS_PATH) {
        const filePath = path.resolve(process.env.STYLE_EXPECTATIONS_PATH);
        if (fs.existsSync(filePath)) {
            STYLE_EXPECTATIONS = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            console.log(`Loaded style expectations from file: ${filePath}`);
        } else {
             console.warn(`Style expectations file not found at path specified by STYLE_EXPECTATIONS_PATH: ${filePath}. Using default expectations.`);
             STYLE_EXPECTATIONS = defaultExpectations;
        }
    }
     else {
        console.log("Using default hardcoded style expectations.");
        STYLE_EXPECTATIONS = defaultExpectations;
    }
} catch (error) {
    console.error("Error loading or parsing style expectations. Using default expectations.", error);
    STYLE_EXPECTATIONS = defaultExpectations; // Fallback on error
}


// == Other Config ==
const ELEMENT_SELECTOR = process.env.ELEMENT_SELECTOR || 'p, span, h1, h2, h3, h4, h5, h6, a, li, button, label, td, th, dd, dt, div';
const TEST_TIMEOUT_MS = parseInt(process.env.TEST_TIMEOUT_MS || '120000', 10); // Increased timeout to 120 seconds
// --- End Test Configuration ---

// --- Helper Functions (Updated to handle arrays) ---
function checkFontFamily(computedFontFamily, expectedFontsArray) {
    if (!expectedFontsArray || expectedFontsArray.length === 0) return true;
    if (!computedFontFamily) return false;
    // Normalize and split the computed font string
    const actualFonts = computedFontFamily.toLowerCase().replace(/["']/g, '').split(',').map(f => f.trim());
    // Normalize the expected fonts array just in case
    const normalizedExpected = expectedFontsArray.map(f => f.toLowerCase().replace(/["']/g, ''));
    // Check if the primary computed font is in the list of expected fonts
    return actualFonts.length > 0 && normalizedExpected.includes(actualFonts[0]);
}

function checkStyleAgainstArray(computedValue, expectedValuesArray) {
    if (!expectedValuesArray || expectedValuesArray.length === 0) return true; // Skip if no expectation
    if (!computedValue) return false;
    // Check if the computed value is included in the array of allowed values
    return expectedValuesArray.includes(computedValue);
}


// --- Test Case ---
test.describe('Element-Specific Style Validation Test', () => {
    test.setTimeout(TEST_TIMEOUT_MS);

    for (const targetUrl of TARGET_URLS) {
        test(`should validate styles on ${targetUrl}`, async ({ page }) => {
            // 1. Navigate
            console.log(`[${targetUrl}] Attempting to navigate...`);
            await page.goto(targetUrl, { waitUntil: 'load', timeout: TEST_TIMEOUT_MS - 5000 });
            console.log(`[${targetUrl}] Navigation successful.`);
            await page.waitForTimeout(1500);

            // 2. Locate elements
            const elements = await page.locator(ELEMENT_SELECTOR).all();
            console.log(`[${targetUrl}] Found ${elements.length} potential elements to analyze.`);

            // 3. Perform Validation
            const mismatchedStyleElements = [];
            let checkedCount = 0;

            for (const element of elements) {
                try {
                    const details = await element.evaluate(el => {
                        const style = window.getComputedStyle(el);
                        const text = (el.textContent || "").trim();
                        const tagName = el.tagName.toLowerCase();
                        const isLikelyIconElement = tagName === 'i' || el.classList.contains('icon');
                        const hasMeaningfulText = text.length > 0;
                        if (!el.checkVisibility() || !hasMeaningfulText || isLikelyIconElement) return null;
                        return {
                            fontFamily: style.fontFamily, fontSize: style.fontSize,
                            lineHeight: style.lineHeight, fontWeight: style.fontWeight,
                            tagName, textContent: text.substring(0, 80) + (text.length > 80 ? '...' : '')
                        };
                    });

                    if (details === null) continue;
                    checkedCount++;
                    const { fontFamily, fontSize, lineHeight, fontWeight, tagName, textContent } = details;

                    const expectedStyles = STYLE_EXPECTATIONS[tagName] || STYLE_EXPECTATIONS['default'] || {};
                    const mismatches = [];

                    if (!checkFontFamily(fontFamily, expectedStyles.fontFamily)) {
                        mismatches.push({ property: 'font-family', expected: (expectedStyles.fontFamily || []).join(' or '), found: fontFamily });
                    }
                    if (!checkStyleAgainstArray(fontSize, expectedStyles.fontSize)) {
                        mismatches.push({ property: 'font-size', expected: (expectedStyles.fontSize || []).join(' or '), found: fontSize });
                    }
                    if (!checkStyleAgainstArray(lineHeight, expectedStyles.lineHeight)) {
                        mismatches.push({ property: 'line-height', expected: (expectedStyles.lineHeight || []).join(' or '), found: lineHeight });
                    }
                    if (!checkStyleAgainstArray(fontWeight, expectedStyles.fontWeight)) {
                        mismatches.push({ property: 'font-weight', expected: (expectedStyles.fontWeight || []).join(' or '), found: fontWeight });
                    }

                    if (mismatches.length > 0) {
                        mismatchedStyleElements.push({ tag: tagName, text: textContent, mismatches });
                    }
                } catch (e) {
                     if (e.message.includes('Target page, context or browser has been closed')) {
                        console.warn(`Skipping element due to closed target: ${e.message}`);
                        break;
                    }
                    console.error(` Error checking element: ${e.message}`);
                }
            }
            console.log(`\n[${targetUrl}] Analyzed ${checkedCount} visible elements with text content.`);

            // 4. Report Results
            expect(mismatchedStyleElements, `[${targetUrl}] Style validation failed. Found ${mismatchedStyleElements.length} elements with mismatched styles:\n${JSON.stringify(mismatchedStyleElements, null, 2)}`).toEqual([]);
            if (mismatchedStyleElements.length === 0) {
                 console.log(`✅ [${targetUrl}] Style validation successful!`);
            }
        });
    }
});
