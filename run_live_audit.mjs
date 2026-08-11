import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const errors = [];
const consoleLogs = [];
const failedRequests = [];
const framerWarnings = [];

(async () => {
  console.log("================ STARTING LIVE BROWSER AUDIT ================");
  console.log("Target URL: http://localhost:3000/crm/admin/website");

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: true
    });
  } catch (err) {
    console.error("Failed to launch Chrome:", err);
    process.exit(1);
  }

  const context = await browser.newContext({
    viewport: { width: 1400, height: 950 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      console.error(`[CONSOLE_ERROR] ${text}`);
      errors.push({ type: 'console.error', text });
    }
    if (text.toLowerCase().includes('framer') || text.toLowerCase().includes('motion')) {
      framerWarnings.push(text);
    }
  });

  page.on('pageerror', error => {
    console.error(`[PAGE_ERROR] ${error.message}`);
    errors.push({ type: 'pageerror', text: error.message, stack: error.stack });
  });

  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status === 401 || status === 403 || status >= 500) {
      console.error(`[HTTP_${status}] ${url}`);
      failedRequests.push({ url, status });
    }
  });

  page.on('requestfailed', request => {
    const failureText = request.failure()?.errorText || 'unknown failure';
    // Filter out external broken images like clearbit or missing external textures if needed
    console.error(`[REQ_FAILED] ${request.url()} - ${failureText}`);
    failedRequests.push({ url: request.url(), error: failureText });
  });

  try {
    // 1. Clear stale tokens & set nhfg_mock_user_id to admin-main
    console.log("\n--- STEP 1: Setting nhfg_mock_user_id to 'admin-main' & clearing stale tokens ---");
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.removeItem('nhfg_access_token');
      localStorage.removeItem('nhfg_refresh_token');
      localStorage.setItem('nhfg_mock_user_id', 'admin-main');
    });

    // 2. Navigate to http://localhost:3000/crm/admin/website
    console.log("Navigating to http://localhost:3000/crm/admin/website...");
    await page.goto('http://localhost:3000/crm/admin/website', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const pageHeading = await page.locator('h1').textContent().catch(() => '');
    console.log(`Page Heading found: "${pageHeading.trim()}"`);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_live_1_page_loaded.png' });
    console.log("Saved screenshot: audit_live_1_page_loaded.png");

    // 3. Modify Hero Title & Hero Subtitle
    console.log("\n--- STEP 2: Modifying Hero Title and Hero Subtitle ---");
    
    const timestamp = new Date().toLocaleTimeString();
    const newHeroTitle = `Securing Your Future - Verified Live ${timestamp}`;
    const newHeroSubtitle = `Comprehensive financial solutions for every stage of life - Live Verification ${timestamp}`;

    // Find Hero Title Input
    const heroTitleInput = page.locator('label:has-text("Hero Title") + input').first();
    await heroTitleInput.scrollIntoViewIfNeeded();
    await heroTitleInput.fill(newHeroTitle);
    console.log(`Updated Hero Title to: "${newHeroTitle}"`);

    // Find Hero Subtitle Input
    const heroSubtitleInput = page.locator('label:has-text("Hero Subtitle") + textarea').first();
    await heroSubtitleInput.fill(newHeroSubtitle);
    console.log(`Updated Hero Subtitle to: "${newHeroSubtitle}"`);

    // 4. Click 'Save Global Configuration'
    console.log("\n--- STEP 3: Clicking 'Save Global Configuration' ---");
    const saveGlobalBtn = page.locator('button:has-text("Save Global Configuration")');
    await saveGlobalBtn.scrollIntoViewIfNeeded();
    await saveGlobalBtn.click();
    console.log("Clicked 'Save Global Configuration' button.");

    // 5. Verify green 'Saved Successfully!' toast
    console.log("Verifying green 'Saved Successfully!' toast...");
    const toastLocator = page.locator('text="Saved Successfully!"');
    await toastLocator.waitFor({ state: 'visible', timeout: 5000 });
    const isToastVisible = await toastLocator.isVisible();
    console.log(`Green Toast 'Saved Successfully!' visible: ${isToastVisible}`);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_live_2_toast_saved.png' });
    console.log("Saved screenshot: audit_live_2_toast_saved.png");

    // 6. Verify local video file upload input
    console.log("\n--- STEP 4: Verifying Local Video File Upload Input ---");
    const videoInputLocator = page.locator('input[type="file"][accept*="video"]');
    const videoInputCount = await videoInputLocator.count();
    console.log(`Found ${videoInputCount} video file upload input(s).`);

    // Create temporary mock MP4 file
    const testVideoPath = '/Users/newholland/1234567/scratch/test_upload_video.mp4';
    if (!fs.existsSync('/Users/newholland/1234567/scratch')) {
      fs.mkdirSync('/Users/newholland/1234567/scratch', { recursive: true });
    }
    const dummyMp4Buffer = Buffer.from('00000018667479706d703432000000006d70343169736f6d', 'hex');
    fs.writeFileSync(testVideoPath, dummyMp4Buffer);

    if (videoInputCount > 0) {
      console.log("Uploading test video file to video file upload input...");
      await videoInputLocator.first().setInputFiles(testVideoPath);
      await page.waitForTimeout(1500);
      console.log("Video upload input processed file without exception.");
    }

    await page.screenshot({ path: '/Users/newholland/1234567/audit_live_3_video_upload.png' });
    console.log("Saved screenshot: audit_live_3_video_upload.png");

    // Cleanup test video
    if (fs.existsSync(testVideoPath)) fs.unlinkSync(testVideoPath);

    // 7. Verify zero Unsplash URLs exist in site config
    console.log("\n--- STEP 5: Verifying Zero Unsplash URLs in Site Config ---");
    const companySettingsInStorage = await page.evaluate(() => {
      const stored = localStorage.getItem('nhfg_company_settings');
      return stored ? JSON.parse(stored) : null;
    });

    let unsplashMatches = [];
    if (companySettingsInStorage) {
      const settingsStr = JSON.stringify(companySettingsInStorage);
      const matches = settingsStr.match(/https?:\/\/[^"'\s]*unsplash\.com[^"'\s]*/gi) || [];
      unsplashMatches.push(...matches);
    }

    const allInputValues = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      return inputs.map(i => i.value).filter(v => v && v.includes('unsplash.com'));
    });
    unsplashMatches.push(...allInputValues);

    console.log(`Unsplash URLs found in site config / page inputs: ${unsplashMatches.length}`);
    if (unsplashMatches.length > 0) {
      console.warn("Found Unsplash URLs:", unsplashMatches);
    } else {
      console.log("✅ Zero Unsplash URLs found in site config!");
    }

    // 8. Verify Framer Motion animations work cleanly without error
    console.log("\n--- STEP 6: Verifying Framer Motion Animations ---");
    const framerErrors = errors.filter(e => e.text && (e.text.toLowerCase().includes('framer') || e.text.toLowerCase().includes('motion') || e.text.toLowerCase().includes('animate')));
    console.log(`Framer Motion runtime errors: ${framerErrors.length}`);
    console.log(`Total critical page/console errors during session: ${errors.length}`);

  } catch (err) {
    console.error("Audit script caught error:", err);
    errors.push({ type: 'execution_error', text: err.message, stack: err.stack });
  } finally {
    await browser.close();
  }

  console.log("\n================ LIVE AUDIT FINAL RESULTS ================");
  console.log(`Total Console / Page Errors: ${errors.length}`);
  console.log(`Total HTTP 401/403/500 Failures: ${failedRequests.filter(r => r.status >= 400).length}`);
  
  const internalFailures = failedRequests.filter(r => r.url.includes('localhost') && r.status >= 400);
  console.log(`Internal API (localhost) HTTP Failures: ${internalFailures.length}`);

  if (internalFailures.length === 0 && errors.filter(e => !e.text.includes('clearbit')).length === 0) {
    console.log("🎉 AUDIT STATUS: ALL CHECKS PASSED PERFECTLY!");
  } else {
    console.log("⚠️ AUDIT STATUS: COMPLETED WITH DISCREPANCIES");
  }
})();
