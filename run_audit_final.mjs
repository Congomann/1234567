import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log("Navigating to https://newhollandfinancial.com/ ...");
  const response = await page.goto("https://newhollandfinancial.com/", { waitUntil: 'networkidle' });
  if (response && !response.ok()) {
    console.error("Failed to load page: " + response.status());
  } else {
    console.log("Page loaded. Inspecting footer...");
    // Just evaluate and dump the text for the 4 columns
    const footerData = await page.evaluate(() => {
       const res = {};
       const footer = document.querySelector('footer');
       if (!footer) return { error: "No footer found" };
       res.html = footer.outerHTML;
       return res;
    });
    console.log("Footer Extracted.");
    if (footerData.html) {
      fs.writeFileSync('footer_html.txt', footerData.html);
    } else {
      console.log(footerData.error);
    }
  }

  console.log("Navigating to login...");
  await page.goto("https://newhollandfinancial.com/login", { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'info@newhollandfinancial.com');
  await page.fill('input[type="password"]', 'NewHollandAdmin@2025');
  await page.click('button[type="submit"]');

  console.log("Waiting for navigation to logistics...");
  await page.waitForTimeout(5000);
  
  await page.goto("https://newhollandfinancial.com/crm/logistics", { waitUntil: 'networkidle' });
  console.log("Checking for 500 errors or successful load...");
  const bodyText = await page.textContent('body');
  if (bodyText.includes("500") || bodyText.includes("Database") || bodyText.includes("SSL")) {
    console.log("ERROR: 500 or DB error found in text");
    console.log("Text snapshot:", bodyText.substring(0, 200));
  } else {
    console.log("Logistics Dashboard Loaded successfully.");
  }
  
  await browser.close();
})();
