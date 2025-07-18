# 🎨 Playwright CSS Style Validator

This script uses **[Playwright Test](https://playwright.dev/docs/test-intro)** to automatically validate CSS styles for HTML elements across one or more webpages, helping teams enforce consistent design systems.

It includes a built-in login flow for password-protected websites and produces detailed HTML reports highlighting any discrepancies.

## ✅ Features

* **Comprehensive Style Validation**
  Validates `font-family`, `font-size`, `line-height`, `font-weight`, `font-style`, `text-transform`, `letter-spacing`, and `color`.

* **Element-Specific Rules**
  Define style expectations per HTML tag (e.g., `h1`, `p`, `a`).

* **Array-Based Expectations**
  Accept multiple valid values for any style (e.g., `fontSize: ["17px", "15px"]`).

* **Automated Login Flow**
  Supports password-protected pages with a predefined login password.

* **Tests Multiple Pages**
  Run validations across multiple URLs in a single execution.

* **Environment Variable Config**
  All options can be configured dynamically without modifying the script.

* **HTML Reporting**
  Generates an interactive report viewable in your browser.


## 📦 Prerequisites

* **[Node.js](https://nodejs.org/)**
* **npm or yarn**



## 🚀 Setup

### 1. Clone the Repository (or Save the Script)

```bash
git clone <your-repo-url>
cd <your-repo-directory>
```

Or simply save `style-validator.spec.js` into your project directory.

### 2. Install Dependencies

```bash
npm install --save-dev @playwright/test
# or
yarn add --dev @playwright/test
```

### 3. Install Playwright Browsers

```bash
npx playwright install
```



## ⚙️ Configuration

### 1. Enable HTML Reporter in `playwright.config.js`

```js
// playwright.config.js
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
});
```

### 2. Configure via Environment Variables (Recommended)

| Variable                  | Description                          | Example                                           |
| ------------------------- | ------------------------------------ | ------------------------------------------------- |
| `TARGET_URLS`             | Comma-separated list of URLs to test | `"https://site.com/page1,https://site.com/page2"` |
| `TARGET_URL`              | Fallback single URL                  | `"https://site.com"`                              |
| `LOGIN_PASSWORD`          | Password for login modal             | `"your_secret_password"`                          |
| `STYLE_EXPECTATIONS_JSON` | Inline JSON string of expectations   | `'{"h1":{"fontSize":["40px"]}}'`                  |
| `STYLE_EXPECTATIONS_PATH` | Path to a JSON file of expectations  | `"./config/styles.json"`                          |
| `ELEMENT_SELECTOR`        | CSS selector to choose elements      | `"h1, h2, p, a"`                                  |
| `TEST_TIMEOUT_MS`         | Max time per test (ms)               | `180000`                                          |

**Priority Order**:

* `STYLE_EXPECTATIONS_JSON` overrides `STYLE_EXPECTATIONS_PATH`
* Environment variables override hardcoded defaults

### 3. Edit the `defaultExpectations` in the Script (Optional)

Example:

```js
const defaultExpectations = {
  'h1': {
    color: ["rgb(35, 31, 32)"],
    fontFamily: ["Saira"],
    fontSize: ["72px", "50px"],
    fontStyle: ["italic"],
    fontWeight: ["900"],
    lineHeight: ["79.2px", "55px"],
    textTransform: ["uppercase"],
    letterSpacing: null
  },
  // Add h2, p, a, button, etc...
};
```

> 💡 *Use browser dev tools to inspect computed styles and ensure accuracy (e.g., color in `rgb()`, font size in `px`).*


## ▶️ Running the Test

### Basic Run (uses default settings):

```bash
npx playwright test style-validator.spec.js
```

### With Environment Variables

#### Bash (macOS/Linux)

```bash
TARGET_URLS="https://site.com/page1,https://site.com/page2" \
LOGIN_PASSWORD="your_password" \
npx playwright test style-validator.spec.js
```

#### Windows CMD

```cmd
set TARGET_URLS=https://site.com/page1,https://site.com/page2
set LOGIN_PASSWORD=your_password
npx playwright test style-validator.spec.js
```

#### PowerShell

```powershell
$env:TARGET_URLS = "https://site.com/page1,https://site.com/page2"
$env:LOGIN_PASSWORD = "your_password"
npx playwright test style-validator.spec.js
```



## 📊 Interpreting Results

After the test run, open the interactive report:

```bash
npx playwright show-report
```

* ✅ **Green Checkmark** — All expected styles match
* ❌ **Red X** — Mismatched style(s); click to view the specific property and value issues



## 🛠️ Troubleshooting

* **Timeouts**:
  Increase `TEST_TIMEOUT_MS` (e.g., to 180000 ms)

* **Login not working?**

  * Check `LOGIN_PASSWORD`
  * Validate selectors for input and button match site

* **Style mismatches?**

  * Use exact computed styles (e.g., `rgb()` instead of hex)
  * Include all valid values (e.g., mobile vs. desktop styles)

* **"expectedFont.toLowerCase is not a function"**
  Ensure **all style properties** in expectations are **arrays**, even with one value:

  ```js
  fontFamily: ["Saira"]
  ```


## 📁 Example JSON Style Expectations

```json
{
  "h1": {
    "color": ["rgb(35, 31, 32)"],
    "fontFamily": ["Saira"],
    "fontSize": ["72px", "50px"],
    "fontStyle": ["italic"],
    "fontWeight": ["900"],
    "lineHeight": ["79.2px", "55px"],
    "textTransform": ["uppercase"],
    "letterSpacing": null
  },
  "p": {
    "color": ["rgb(35, 31, 32)"],
    "fontFamily": ["Inter"],
    "fontSize": ["15px"],
    "fontStyle": ["normal"],
    "fontWeight": ["400"],
    "lineHeight": ["24px"],
    "textTransform": ["none"],
    "letterSpacing": null
  }
}
```



## 📬 Contributing

Want to improve this tool? Feel free to open issues or submit PRs!



## 📝 License

MIT License



Let me know if you'd like me to generate a `README.md` file from this directly, or help with the repo setup.
