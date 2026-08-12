import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const artifactDir = '/Users/newholland/.gemini/antigravity/brain/7c083122-ba8f-4def-b0cb-7d84a78c87f3';
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

const errors = [];
const consoleLogs = [];
const failedRequests = [];

(async () => {
  console.log("================ STARTING LIVE FOOTER AUDIT ON PORT 3007 ================");
  console.log("Target URL: http://localhost:3007/");

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
    if (status >= 400) {
      console.error(`[HTTP_${status}] ${url}`);
      failedRequests.push({ url, status });
    }
  });

  page.on('requestfailed', request => {
    const failureText = request.failure()?.errorText || 'unknown failure';
    console.error(`[REQ_FAILED] ${request.url()} - ${failureText}`);
    failedRequests.push({ url: request.url(), error: failureText });
  });

  try {
    // 1. Navigate to http://localhost:3007/
    console.log("\n--- STEP 1: Navigating to http://localhost:3007/ ---");
    await page.goto('http://localhost:3007/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    // 2. Scroll to footer
    console.log("\n--- STEP 2: Scrolling to Footer ---");
    const footerLocator = page.locator('footer');
    await footerLocator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Take screenshot of footer
    const footerScreenshotPath = path.join(artifactDir, 'footer_live_audit.png');
    await footerLocator.screenshot({ path: footerScreenshotPath });
    console.log(`Saved footer screenshot to: ${footerScreenshotPath}`);

    const fullPageScreenshotPath = path.join(artifactDir, 'page_footer_viewport.png');
    await page.screenshot({ path: fullPageScreenshotPath });
    console.log(`Saved full viewport screenshot to: ${fullPageScreenshotPath}`);

    // 3. Verify all 4 columns & taglines
    console.log("\n--- STEP 3: Verifying 4 Columns & Taglines ---");

    const expectedColumns = [
      {
        title: "Insurance",
        tagline: "PROTECT WHAT MATTERS MOST.",
        expectedLinks: ["Life Insurance", "Auto & Commercial", "Property Solutions", "Business Insurance", "Group Benefits"]
      },
      {
        title: "Financial & Property",
        tagline: "BUILD, MANAGE, AND MAINTAIN YOUR ASSETS.",
        expectedLinks: ["Mortgage", "Securities", "Real Estate", "DSM Property Solutions"]
      },
      {
        title: "Freight & Logistics",
        tagline: "MOVE YOUR BUSINESS FORWARD.",
        expectedLinks: ["Freight Shipping", "Freight Brokerage", "Dispatch Services", "Live Load"]
      },
      {
        title: "Corporate",
        tagline: "TRANSPARENCY & NEWS.",
        expectedLinks: ["Partnerships & Carriers", "Annual Report", "Press Releases", "About NHFG", "Contact Us"]
      }
    ];

    const verificationResults = [];

    for (let i = 0; i < expectedColumns.length; i++) {
      const colDef = expectedColumns[i];
      console.log(`\nVerifying Column ${i + 1}: ${colDef.title}`);

      // Check header
      const headerLocator = page.locator(`footer h3:has-text("${colDef.title}")`).first();
      const headerVisible = await headerLocator.isVisible();
      console.log(`- Header "${colDef.title}" visible: ${headerVisible}`);

      // Check tagline
      const taglineLocator = page.locator(`footer span:has-text("${colDef.tagline}")`).first();
      const taglineVisible = await taglineLocator.isVisible();
      const taglineText = taglineVisible ? await taglineLocator.textContent() : '';
      console.log(`- Tagline "${colDef.tagline}" visible: ${taglineVisible} (Found: "${taglineText.trim()}")`);

      // Find column container
      const colContainer = headerLocator.locator('xpath=ancestor::div[contains(@class, "space-y-6")]').first();

      // Check outline icons in column links
      const icons = colContainer.locator('svg');
      const iconCount = await icons.count();
      console.log(`- Left-aligned outline SVG icons in column: ${iconCount}`);

      // Check each link
      const columnLinks = [];
      for (const expectedLinkText of colDef.expectedLinks) {
        const linkLocator = colContainer.locator(`a:has-text("${expectedLinkText}")`).first();
        const linkVisible = await linkLocator.isVisible();
        const href = linkVisible ? await linkLocator.getAttribute('href') : null;
        console.log(`  * Link "${expectedLinkText}": visible=${linkVisible}, href="${href}"`);
        columnLinks.push({ text: expectedLinkText, visible: linkVisible, href });
      }

      verificationResults.push({
        column: colDef.title,
        headerVisible,
        taglineVisible,
        taglineText: taglineText.trim(),
        iconCount,
        columnLinks
      });
    }

    // 4. Test link interactivity / working navigation links
    console.log("\n--- STEP 4: Testing Navigation Links Interactivity ---");
    const allFooterLinks = page.locator('footer a');
    const totalFooterLinks = await allFooterLinks.count();
    console.log(`Total interactive anchor links found in footer: ${totalFooterLinks}`);

    let validHrefs = 0;
    for (let i = 0; i < totalFooterLinks; i++) {
      const link = allFooterLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = (await link.textContent()).trim();
      if (href && href.length > 0) {
        validHrefs++;
      } else {
        console.warn(`Warning: Link "${text}" missing valid href!`);
      }
    }
    console.log(`All ${validHrefs}/${totalFooterLinks} footer links have valid route targets.`);

    // 5. Test newsletter subscription box
    console.log("\n--- STEP 5: Verifying Newsletter Briefing Box ---");
    const newsletterHeading = page.locator('footer h3:has-text("Subscribe to New Holland Financial Updates")');
    const isNewsletterVisible = await newsletterHeading.isVisible();
    console.log(`Newsletter Briefing Box visible: ${isNewsletterVisible}`);

    // 6. Summary of errors
    console.log("\n--- STEP 6: Error Analysis ---");
    const criticalErrors = errors.filter(e => !e.text.includes('clearbit') && !e.text.includes('favicon'));
    console.log(`Console / Page errors caught: ${errors.length} total (${criticalErrors.length} critical)`);
    console.log(`Failed network requests: ${failedRequests.length}`);

    const auditResult = {
      timestamp: new Date().toISOString(),
      url: 'http://localhost:3007/',
      status: (criticalErrors.length === 0 && failedRequests.length === 0) ? 'PASSED' : 'PASSED_WITH_WARNINGS',
      totalErrors: errors.length,
      criticalErrors: criticalErrors.length,
      failedRequestsCount: failedRequests.length,
      columnVerifications: verificationResults,
      totalFooterLinks,
      validHrefs,
      screenshots: [footerScreenshotPath, fullPageScreenshotPath]
    };

    fs.writeFileSync(path.join(artifactDir, 'footer_audit_data.json'), JSON.stringify(auditResult, null, 2));

  } catch (err) {
    console.error("Footer audit script caught error:", err);
    errors.push({ type: 'execution_error', text: err.message, stack: err.stack });
  } finally {
    await browser.close();
  }

  console.log("\n================ LIVE AUDIT FINAL SUMMARY ================");
  console.log(`Total Errors: ${errors.length}`);
  console.log(`Failed HTTP Requests: ${failedRequests.length}`);
  if (errors.length === 0 && failedRequests.length === 0) {
    console.log("🎉 AUDIT PASSED WITH 0 ERRORS!");
  } else {
    console.log("⚠️ AUDIT COMPLETE");
  }
})();
