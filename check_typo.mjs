import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://newhollandfinancial.com/', { waitUntil: 'networkidle' });
  const input = await page.$('input[type="email"]');
  if (input) {
    const placeholder = await input.getAttribute('placeholder');
    console.log('PLACEHOLDER:', placeholder);
  } else {
    console.log('No email input found');
  }
  await browser.close();
})();
