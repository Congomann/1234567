import { chromium } from 'playwright-core';

(async () => {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log(`[CONSOLE] ${msg.type()}: ${msg.text()}`));
  page.on('pageerror', error => console.error(`[PAGE_ERROR] ${error.message}`));
  page.on('requestfailed', request => console.error(`[REQ_FAILED] ${request.url()} - ${request.failure()?.errorText}`));
  page.on('response', response => {
    if(!response.ok()) console.log(`[HTTP_ERROR] ${response.status()} ${response.url()}`);
  });

  console.log("Navigating to http://localhost:4173...");
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
  
  const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log(`Root innerHTML length: ${rootHtml?.length}`);

  await page.screenshot({ path: 'preview_screenshot.png' });
  await browser.close();
  console.log("Done.");
})();
