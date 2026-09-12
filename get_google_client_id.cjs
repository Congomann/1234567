const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false, channel: 'chrome' }); 
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('https://console.cloud.google.com/apis/credentials');

  try {
    await page.waitForFunction(() => {
      const texts = document.body.innerText;
      return texts.includes('.apps.googleusercontent.com');
    }, null, { timeout: 0 });

    const clientId = await page.evaluate(() => {
      const match = document.body.innerText.match(/([a-zA-Z0-9-]+\.apps\.googleusercontent\.com)/);
      return match ? match[1] : null;
    });

    console.log("FOUND: " + clientId);
    fs.writeFileSync('/tmp/google_client_id.txt', clientId);
    
    await browser.close();
  } catch (err) {
    console.error("Error occurred:", err);
    await browser.close();
  }
})();
