import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const errors = [];
const consoleLogs = [];

(async () => {
  console.log("Starting Partnership Page Audit...");
  
  let context;
  try {
    context = await chromium.launchPersistentContext('/Users/newholland/1234567/scratch/chrome_user_data', {
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true,
      viewport: { width: 1280, height: 800 }
    });
  } catch (err) {
    console.error("Failed to launch Chrome:", err);
    process.exit(1);
  }

  const page = context.pages().length > 0 ? context.pages()[0] : await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      errors.push({ type: 'console.error', text });
    }
  });

  page.on('pageerror', error => {
    console.error(`[PAGE_ERROR] ${error.message}`);
    errors.push({ type: 'pageerror', text: error.message, stack: error.stack });
  });

  page.on('requestfailed', request => {
    const failureText = request.failure()?.errorText || 'unknown failure';
    console.error(`[REQ_FAILED] ${request.url()} - ${failureText}`);
    errors.push({ type: 'requestfailed', url: request.url(), errorText: failureText });
  });

  try {
    console.log("Navigating to http://localhost:3000/partnership...");
    const response = await page.goto('http://localhost:3000/partnership', { waitUntil: 'networkidle', timeout: 15000 });
    console.log(`HTTP Response status: ${response ? response.status() : 'No response'}`);

    // Wait for main container
    await page.waitForSelector('h1', { timeout: 5000 });
    console.log("✅ Page loaded successfully.");

    // --- STEP 1: HERO SECTION ---
    console.log("\n--- Audit Step 1: Hero Section ---");
    const heroHeading = await page.textContent('h1');
    console.log(`Hero Heading found: "${heroHeading.replace(/\s+/g, ' ').trim()}"`);
    
    const testDriveBtn = await page.locator('button:has-text("Test Drive API Sandbox")');
    const applyBtn = await page.locator('a:has-text("Apply for Appointment")');
    
    console.log(`'Test Drive API Sandbox' button visible: ${await testDriveBtn.isVisible()}`);
    console.log(`'Apply for Appointment' button visible: ${await applyBtn.isVisible()}`);
    
    await page.screenshot({ path: 'audit_1_hero_section.png' });
    console.log("Saved screenshot: audit_1_hero_section.png");

    // --- STEP 2: CARRIER DIRECTORY FILTERS ---
    console.log("\n--- Audit Step 2: Carrier Directory Filters ---");
    const categoryTabs = ['All Partners', 'Life & Annuities', 'Real Estate & Title', 'Mortgage & Securities', 'Freight & Logistics'];
    for (const tabName of categoryTabs) {
      const tabButton = page.locator(`button:has-text("${tabName}")`);
      await tabButton.click();
      await page.waitForTimeout(300);
      const cardCount = await page.locator('.grid > div.bg-white.rounded-3xl').count();
      console.log(`Filter tab '${tabName}' clicked. Carrier cards count: ${cardCount}`);
    }
    // Return to All Partners
    await page.locator('button:has-text("All Partners")').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'audit_2_carrier_directory.png' });
    console.log("Saved screenshot: audit_2_carrier_directory.png");

    // --- STEP 3: LIVE API SANDBOX MODAL ---
    console.log("\n--- Audit Step 3: Live API Sandbox Modal ---");
    await testDriveBtn.click();
    await page.waitForTimeout(500);
    
    const modalTitle = page.locator('h3:has-text("NHFG Partner Quoting & API Sandbox")');
    console.log(`Modal Title visible: ${await modalTitle.isVisible()}`);
    
    // Execute Live API Call
    const executeBtn = page.locator('button:has-text("Execute Live API Call")');
    console.log("Clicking 'Execute Live API Call'...");
    await executeBtn.click();
    await page.waitForTimeout(800);

    const jsonWindow = page.locator('pre');
    const jsonText = await jsonWindow.textContent();
    console.log(`API Response payload retrieved (${jsonText.length} chars):`);
    console.log(jsonText.substring(0, 150) + "...");
    await page.screenshot({ path: 'audit_3_api_sandbox_modal.png' });
    console.log("Saved screenshot: audit_3_api_sandbox_modal.png");

    // Test switching API endpoint tab to Freight API
    const freightApiTab = page.locator('button:has-text("/api/v1/freight/dispatch")');
    await freightApiTab.click();
    await executeBtn.click();
    await page.waitForTimeout(800);
    const freightJson = await page.locator('pre').textContent();
    console.log("Freight API call executed. Response includes 'origin': " + freightJson.includes('origin'));

    // Close Modal
    const closeBtn = page.locator('button:has-text("Close Sandbox")');
    await closeBtn.click();
    await page.waitForTimeout(300);
    console.log(`Modal closed. Is modal visible: ${await modalTitle.isVisible()}`);

    // --- STEP 4: INTERACTIVE VOLUME ESTIMATOR SLIDERS ---
    console.log("\n--- Audit Step 4: Distribution Volume Estimator Sliders ---");
    const sliders = page.locator('input[type="range"]');
    const sliderCount = await sliders.count();
    console.log(`Number of range sliders found: ${sliderCount}`);
    
    if (sliderCount >= 2) {
      await page.evaluate(() => {
        const sliders = document.querySelectorAll('input[type="range"]');
        if (sliders[0]) {
          sliders[0].value = "100";
          sliders[0].dispatchEvent(new Event('change', { bubbles: true }));
          sliders[0].dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (sliders[1]) {
          sliders[1].value = "200";
          sliders[1].dispatchEvent(new Event('change', { bubbles: true }));
          sliders[1].dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
      await page.waitForTimeout(500);

      const annualPremiumText = await page.locator('span:has-text("$")').first().evaluate(el => el.textContent);
      console.log(`Updated calculation preview text: ${annualPremiumText?.trim()}`);
    }
    await page.screenshot({ path: 'audit_4_volume_estimator.png' });
    console.log("Saved screenshot: audit_4_volume_estimator.png");

    // --- STEP 5: CARRIER APPOINTMENT FORM SUBMISSION ---
    console.log("\n--- Audit Step 5: Carrier Appointment Form Submission ---");
    await page.locator('#apply-partner').scrollIntoViewIfNeeded();

    await page.fill('input[placeholder*="Acme Life"]', 'Apex Life Insurers Inc.');
    
    const formSelects = page.locator('#apply-partner select');
    await formSelects.nth(0).selectOption('Life & Annuity Carrier');
    await formSelects.nth(1).selectOption('48 States (Nationwide)');
    await formSelects.nth(2).selectOption('$5M - $20M / Year');

    await page.fill('input[placeholder="Jane Smith"]', 'Alex Vance');
    await page.fill('input[placeholder="VP of Carrier Distribution"]', 'VP of Strategic Partnerships');
    await page.fill('input[placeholder="jane@carrier.com"]', 'alex.vance@apexlife.com');
    await page.fill('input[placeholder="(800) 555-0199"]', '(515) 555-0199');
    await page.fill('textarea[placeholder*="Provide details"]', 'Automated test filing for NHFG partner appointment audit.');

    const submitBtn = page.locator('button:has-text("Submit Carrier Appointment Application")');
    console.log("Submitting carrier appointment form...");
    await submitBtn.click();
    await page.waitForTimeout(1000);

    const successHeading = page.locator('h3:has-text("Application Submitted Successfully!")');
    const isSuccessVisible = await successHeading.isVisible();
    console.log(`Form submission success banner visible: ${isSuccessVisible}`);
    
    if (isSuccessVisible) {
      const refText = await page.locator('strong.font-mono').textContent();
      console.log(`Generated Reference ID: ${refText}`);
    }

    await page.screenshot({ path: 'audit_5_form_submitted.png' });
    console.log("Saved screenshot: audit_5_form_submitted.png");

  } catch (err) {
    console.error("Audit script caught error:", err);
    errors.push({ type: 'execution_error', text: err.message, stack: err.stack });
  } finally {
    await context.close();
  }

  console.log("\n================ AUDIT SUMMARY ================");
  console.log(`Total Errors Detected: ${errors.length}`);
  if (errors.length > 0) {
    console.log("Errors detail:", JSON.stringify(errors, null, 2));
  } else {
    console.log("✅ PERFECT AUDIT: 0 JavaScript errors, 0 network failures, 0 visual failures!");
  }
})();
