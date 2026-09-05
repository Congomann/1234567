const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:3031/crm/dashboard', { waitUntil: 'networkidle0' });
  
  // Wait a bit just in case
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Try to find the error boundary text
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('BODY TEXT:', bodyText);
  
  await browser.close();
})();
