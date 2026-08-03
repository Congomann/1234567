import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = '/Users/newholland/.gemini/antigravity/brain/04c1db19-3bf5-48c0-92e2-126f18b3ed3f';

const logs = {
  console: [],
  pageErrors: [],
  networkFailures: [],
  httpErrors: []
};

async function runAudit() {
  console.log('Starting Live Browser Audit...');
  
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });

  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    logs.console.push({ type, text, location: msg.location() });
    if (type === 'error') {
      console.error(`[CONSOLE ERROR] ${text}`);
    }
  });

  page.on('pageerror', error => {
    logs.pageErrors.push(error.message || String(error));
    console.error(`[PAGE ERROR] ${error.message}`);
  });

  page.on('requestfailed', request => {
    const failure = request.failure()?.errorText || 'unknown';
    logs.networkFailures.push({ url: request.url(), failure });
    console.error(`[REQ FAILED] ${request.url()} - ${failure}`);
  });

  page.on('response', response => {
    if (!response.ok() && response.status() !== 304) {
      logs.httpErrors.push({ status: response.status(), url: response.url() });
      console.warn(`[HTTP ${response.status()}] ${response.url()}`);
    }
  });

  const results = {};

  // 1. Home Page Audit
  console.log('--- Auditing Home Page ---');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  const homeTitle = await page.title();
  const homeHeaderExists = await page.locator('header, nav').first().isVisible().catch(() => false);
  const homeButtonsCount = await page.locator('button, a.btn, a[href]').count();
  
  const homeScreenshot = path.join(ARTIFACT_DIR, 'audit_home.png');
  await page.screenshot({ path: homeScreenshot, fullPage: true });
  
  results.home = {
    title: homeTitle,
    headerVisible: homeHeaderExists,
    interactiveElementsCount: homeButtonsCount,
    screenshot: homeScreenshot
  };

  // 2. Schedule Booking Page Audit
  console.log('--- Auditing Schedule Booking Page ---');
  await page.goto('http://localhost:3000/schedule?advisor=remmy-shabani', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);
  
  const scheduleTitle = await page.title();
  const scheduleText = await page.locator('body').innerText();
  const advisorMentioned = scheduleText.includes('Remmy Shabani') || scheduleText.includes('Remmy');
  
  // Test interaction: click date or time slot if present
  const timeSlots = page.locator('button:has-text("AM"), button:has-text("PM"), button[class*="slot"], button[class*="time"]');
  const slotCount = await timeSlots.count();
  if (slotCount > 0) {
    await timeSlots.first().click().catch(e => console.log('Click slot error:', e.message));
    await page.waitForTimeout(500);
  }

  const scheduleScreenshot = path.join(ARTIFACT_DIR, 'audit_schedule.png');
  await page.screenshot({ path: scheduleScreenshot, fullPage: true });

  results.schedule = {
    title: scheduleTitle,
    advisorFound: advisorMentioned,
    slotCount,
    screenshot: scheduleScreenshot
  };

  // 3. Solutions / Products Page Audit
  console.log('--- Auditing Solutions Page ---');
  await page.goto('http://localhost:3000/products', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const productsTitle = await page.title();
  
  // Test calculator inputs if present
  const sliders = page.locator('input[type="range"]');
  const sliderCount = await sliders.count();
  if (sliderCount > 0) {
    for (let i = 0; i < Math.min(sliderCount, 3); i++) {
      const slider = sliders.nth(i);
      await slider.fill('500000').catch(() => {});
    }
    await page.waitForTimeout(500);
  }

  const numInputs = page.locator('input[type="number"]');
  const numInputCount = await numInputs.count();
  if (numInputCount > 0) {
    await numInputs.first().fill('100000').catch(() => {});
    await page.waitForTimeout(500);
  }

  const productsScreenshot = path.join(ARTIFACT_DIR, 'audit_products.png');
  await page.screenshot({ path: productsScreenshot, fullPage: true });

  results.products = {
    title: productsTitle,
    sliderCount,
    numInputCount,
    screenshot: productsScreenshot
  };

  // 4. Real Estate Page Audit
  console.log('--- Auditing Real Estate Page ---');
  await page.goto('http://localhost:3000/real-estate', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const reTitle = await page.title();
  const reSliders = await page.locator('input[type="range"]').count();
  if (reSliders > 0) {
    await page.locator('input[type="range"]').first().fill('750000').catch(() => {});
    await page.waitForTimeout(500);
  }

  const reScreenshot = path.join(ARTIFACT_DIR, 'audit_real_estate.png');
  await page.screenshot({ path: reScreenshot, fullPage: true });

  results.realEstate = {
    title: reTitle,
    sliderCount: reSliders,
    screenshot: reScreenshot
  };

  // 5. Footer & Navigation Audit
  console.log('--- Auditing Footer ---');
  const footerExists = await page.locator('footer').isVisible().catch(() => false);
  const footerLinks = page.locator('footer a');
  const footerLinkCount = await footerLinks.count();
  const footerHrefs = [];
  for (let i = 0; i < footerLinkCount; i++) {
    const href = await footerLinks.nth(i).getAttribute('href');
    const text = await footerLinks.nth(i).innerText();
    footerHrefs.push({ text: text.trim(), href });
  }

  const footerScreenshot = path.join(ARTIFACT_DIR, 'audit_footer.png');
  const footerLocator = page.locator('footer');
  if (await footerLocator.isVisible()) {
    await footerLocator.screenshot({ path: footerScreenshot });
  } else {
    await page.screenshot({ path: footerScreenshot, fullPage: true });
  }

  results.footer = {
    visible: footerExists,
    linkCount: footerLinkCount,
    links: footerHrefs,
    screenshot: footerScreenshot
  };

  // 6. CRM Terminal / Login Page Audit
  console.log('--- Auditing CRM Terminal Login ---');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(1000);

  const loginTitle = await page.title();
  const emailInput = await page.locator('input[type="email"], input[name="email"]').isVisible().catch(() => false);
  const passwordInput = await page.locator('input[type="password"]').isVisible().catch(() => false);
  const submitButton = await page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")').isVisible().catch(() => false);

  const loginScreenshot = path.join(ARTIFACT_DIR, 'audit_login.png');
  await page.screenshot({ path: loginScreenshot, fullPage: true });

  results.login = {
    title: loginTitle,
    emailInput,
    passwordInput,
    submitButton,
    screenshot: loginScreenshot
  };

  await browser.close();

  // Save audit logs and results summary JSON
  const reportData = {
    results,
    logs
  };

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'audit_data.json'), JSON.stringify(reportData, null, 2));
  console.log('Audit completed successfully. Results saved to audit_data.json.');
}

runAudit().catch(err => {
  console.error('Audit Script Error:', err);
  process.exit(1);
});
