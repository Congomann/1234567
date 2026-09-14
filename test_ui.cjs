const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  try {
    fs.writeFileSync('protective_contract.pdf', 'Dummy PDF Content for Contract');
    
    // Login as Admin
    console.log('going to login');
    await page.goto('http://localhost:3006/');
    await page.waitForTimeout(2000);
    // click login link
    await page.click('text="Login"');
    await page.waitForTimeout(2000);
    await page.fill('#email', 'info@newhollandfinancial.com');
    await page.fill('#password', 'NewHollandAdmin@2025');
    await page.click('button:has-text("Login")');
    console.log('logged in');
    await page.waitForTimeout(3000);
    
    // Go to Carrier Contracting
    await page.goto('http://localhost:3006/crm/admin/contracting');
    await page.waitForTimeout(2000);
    
    // Click Add Carrier
    await page.click('button:has-text("Add Carrier")');
    await page.waitForTimeout(1000);
    
    // Fill in carrier details
    await page.fill('input[placeholder="e.g. Mutual of Omaha"]', 'Protective Life');
    // Upload PDF
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.setInputFiles('protective_contract.pdf');
    }
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/Users/newholland/.gemini/antigravity/brain/5fdcb086-18d2-4b45-8235-b16ca7388b19/.user_uploaded/step1_upload.png' });
    
    // Click Save & Digitize
    await page.click('button:has-text("Save & Digitize")');
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/newholland/.gemini/antigravity/brain/5fdcb086-18d2-4b45-8235-b16ca7388b19/.user_uploaded/step2_digitize.png' });

    // Click Map Form Fields
    await page.click('text="Map Form Fields"');
    await page.waitForTimeout(4000); // let the AI scan animation run
    await page.screenshot({ path: '/Users/newholland/.gemini/antigravity/brain/5fdcb086-18d2-4b45-8235-b16ca7388b19/.user_uploaded/step3_mapping.png' });

    console.log('done screenshots');
  } catch(e) {
    console.error(e);
  } finally {
    await browser.close();
  }
})();
