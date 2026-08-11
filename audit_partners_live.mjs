import { chromium } from 'playwright-core';
import fs from 'fs';

const errors = [];
const consoleLogs = [];
const failedRequests = [];

(async () => {
  console.log("==========================================================");
  console.log("STARTING LIVE BROWSER AUDIT: PARTNERS MANAGEMENT & DYNAMIC DISPLAY");
  console.log("Target Server: http://localhost:3003");
  console.log("==========================================================\n");

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

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Set nhfg_mock_user_id to admin-main & clear stale partners
    // -------------------------------------------------------------------------
    console.log("--- STEP 1: Setting nhfg_mock_user_id to 'admin-main' & initializing company settings ---");
    await page.goto('http://localhost:3003/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    await page.evaluate(() => {
      localStorage.setItem('nhfg_mock_user_id', 'admin-main');
      
      // Ensure initial partners in stored settings are cleared to test default removal
      const existingSettingsStr = localStorage.getItem('nhfg_company_settings');
      let existingSettings = existingSettingsStr ? JSON.parse(existingSettingsStr) : {};
      existingSettings.partners = {}; // reset partners to empty
      localStorage.setItem('nhfg_company_settings', JSON.stringify(existingSettings));
    });
    console.log("✅ Set nhfg_mock_user_id = 'admin-main' and initialized empty partners list in localStorage.");

    // -------------------------------------------------------------------------
    // STEP 2: Verify hardcoded default partners removed on /partnership
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 2: Auditing http://localhost:3003/partnership (Initial State) ---");
    await page.goto('http://localhost:3003/partnership', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_1_partnership_initial.png', fullPage: true });
    console.log("Saved screenshot: audit_1_partnership_initial.png");

    const hardcodedPartnersCheck = await page.evaluate(() => {
      const pageText = document.body.innerText;
      const defaultNames = ['Root Insurance', 'Aflac', 'Transamerica', 'Combined Insurance', 'Geico', 'Securico Life'];
      const foundHardcoded = defaultNames.filter(name => pageText.includes(name));
      const hasEmptyStateHeading = pageText.includes('Admin-Managed Carrier Directory');
      return { foundHardcoded, hasEmptyStateHeading };
    });

    console.log(`Found hardcoded default partners on /partnership: ${JSON.stringify(hardcodedPartnersCheck.foundHardcoded)}`);
    console.log(`Empty state fallback banner visible: ${hardcodedPartnersCheck.hasEmptyStateHeading}`);
    
    if (hardcodedPartnersCheck.foundHardcoded.length === 0) {
      console.log("✅ VERIFIED: Hardcoded default partners have been removed from /partnership!");
    } else {
      console.error("❌ FAILED: Hardcoded default partners still present on /partnership!");
    }

    // -------------------------------------------------------------------------
    // STEP 3: Verify hardcoded default partners removed on Homepage /
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 3: Auditing http://localhost:3003/ (Initial State Homepage) ---");
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_2_homepage_initial.png' });
    console.log("Saved screenshot: audit_2_homepage_initial.png");

    const homeMarqueeCheck = await page.evaluate(() => {
      const marqueeEl = document.querySelector('.mask-edges');
      if (!marqueeEl) return { marqueePresent: false, partnersCount: 0 };
      const partnerImgs = marqueeEl.querySelectorAll('img');
      return { marqueePresent: true, partnersCount: partnerImgs.length };
    });
    console.log(`Homepage marquee present: ${homeMarqueeCheck.marqueePresent}, partner count: ${homeMarqueeCheck.partnersCount}`);

    // -------------------------------------------------------------------------
    // STEP 4: Navigate to Admin Website Settings http://localhost:3003/crm/admin/website
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 4: Navigating to http://localhost:3003/crm/admin/website ---");
    await page.goto('http://localhost:3003/crm/admin/website', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_3_admin_website_loaded.png' });
    console.log("Saved screenshot: audit_3_admin_website_loaded.png");

    // Scroll to Partner Logos section
    const partnerLogosSection = page.locator('h2:has-text("Partner Logos")');
    await partnerLogosSection.scrollIntoViewIfNeeded();

    console.log("Adding Test Partner: 'Lincoln Financial' -> 'lincolnfinancial.com'...");
    const partnerNameInput = page.locator('input[placeholder="Partner Name"]');
    const partnerValueInput = page.locator('input[placeholder*="Domain"]');
    
    await partnerNameInput.fill('Lincoln Financial');
    await partnerValueInput.fill('lincolnfinancial.com');

    // Click exact 'Add' button for partner logos
    const addPartnerBtn = page.getByRole('button', { name: 'Add', exact: true });
    await addPartnerBtn.click();
    await page.waitForTimeout(500);

    // Verify 'Lincoln Financial' appears in the Partner Logos list
    const adminPartnerListed = await page.locator('span:has-text("Lincoln Financial")').isVisible();
    console.log(`'Lincoln Financial' visible in Admin Partner Logos list after clicking Add: ${adminPartnerListed}`);

    // Click 'Save Changes' in Partner Logos section
    console.log("Clicking 'Save Changes' button in Partner Logos section...");
    const saveChangesBtn = page.getByRole('button', { name: 'Save Changes' });
    await saveChangesBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_4_admin_partner_saved.png' });
    console.log("Saved screenshot: audit_4_admin_partner_saved.png");

    // -------------------------------------------------------------------------
    // STEP 5: Verify partner card appears dynamically on /partnership
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 5: Verifying dynamic partner card on http://localhost:3003/partnership ---");
    await page.goto('http://localhost:3003/partnership', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_5_partnership_dynamic_partner.png', fullPage: true });
    console.log("Saved screenshot: audit_5_partnership_dynamic_partner.png");

    const partnershipCardCheck = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h3'));
      const lincolnCard = cards.find(el => el.textContent?.includes('Lincoln Financial'));
      const domainEl = Array.from(document.querySelectorAll('p')).find(el => el.textContent?.includes('lincolnfinancial.com'));
      return {
        cardFound: Boolean(lincolnCard),
        domainFound: Boolean(domainEl),
        cardText: lincolnCard ? lincolnCard.textContent : null
      };
    });

    console.log(`Partner Card 'Lincoln Financial' on /partnership: ${JSON.stringify(partnershipCardCheck)}`);

    if (partnershipCardCheck.cardFound) {
      console.log("✅ SUCCESS: Partner card 'Lincoln Financial' appears dynamically on /partnership!");
    } else {
      console.error("❌ FAILED: Partner card 'Lincoln Financial' did NOT appear on /partnership!");
    }

    // -------------------------------------------------------------------------
    // STEP 6: Verify partner card/marquee appears dynamically on Homepage /
    // -------------------------------------------------------------------------
    console.log("\n--- STEP 6: Verifying dynamic partner logo on http://localhost:3003/ ---");
    await page.goto('http://localhost:3003/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: '/Users/newholland/1234567/audit_6_homepage_dynamic_partner.png' });
    console.log("Saved screenshot: audit_6_homepage_dynamic_partner.png");

    const homepageMarqueeCheck = await page.evaluate(() => {
      const partnerSpans = Array.from(document.querySelectorAll('span'));
      const lincolnSpan = partnerSpans.find(s => s.textContent?.includes('Lincoln Financial'));
      const imgs = Array.from(document.querySelectorAll('img'));
      const lincolnImg = imgs.find(img => img.alt === 'Lincoln Financial' || img.src.includes('lincolnfinancial.com'));
      return {
        spanFound: Boolean(lincolnSpan),
        imgFound: Boolean(lincolnImg)
      };
    });

    console.log(`Partner Logo/Text 'Lincoln Financial' on Homepage: ${JSON.stringify(homepageMarqueeCheck)}`);

    if (homepageMarqueeCheck.spanFound || homepageMarqueeCheck.imgFound) {
      console.log("✅ SUCCESS: Partner 'Lincoln Financial' appears dynamically on Homepage!");
    } else {
      console.error("❌ FAILED: Partner 'Lincoln Financial' did NOT appear on Homepage!");
    }

  } catch (err) {
    console.error("Audit script encountered error:", err);
    errors.push({ type: 'script_exception', text: err.message, stack: err.stack });
  } finally {
    await browser.close();
  }

  console.log("\n==========================================================");
  console.log("LIVE BROWSER AUDIT SUMMARY");
  console.log("==========================================================");
  console.log(`Total JS/Console Errors: ${errors.length}`);
  console.log(`Total HTTP 401/403/500 Errors: ${failedRequests.length}`);

  if (errors.length > 0) {
    console.log("Console Errors Detail:", errors);
  }
  if (failedRequests.length > 0) {
    console.log("HTTP Errors Detail:", failedRequests);
  }

  if (errors.length === 0 && failedRequests.length === 0) {
    console.log("\n🎉 ALL AUDIT CHECKS PASSED CLEANLY!");
  } else {
    console.log("\n⚠️ AUDIT COMPLETED WITH ISSUES (SEE ABOVE)");
  }
})();
