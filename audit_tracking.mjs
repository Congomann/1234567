import { chromium } from 'playwright-core';
import fs from 'fs';

(async () => {
  console.log("Starting Live Tracking Audit...");
  const browser = await chromium.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true
  });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();
  
  let gpsPings = 0;
  page.on('console', msg => console.log(`[CONSOLE] ${msg.text()}`));
  page.on('request', req => {
    const url = req.url().toLowerCase();
    if (url.includes('ping') || url.includes('track') || url.includes('location') || url.includes('gps')) {
      if (req.method() === 'POST' || req.method() === 'PUT' || url.includes('api')) {
        console.log(`[NETWORK PING DETECTED] ${req.method()} ${url}`);
        gpsPings++;
      }
    }
  });

  try {
    console.log("1. Navigating to login...");
    await page.goto('http://127.0.0.1:3020/login', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Clear tokens, mock user
    await page.evaluate(() => {
      localStorage.removeItem('nhfg_access_token');
      localStorage.setItem('nhfg_mock_user_id', 'admin-main');
    });

    console.log("Filling credentials...");
    await page.fill('input[type="email"], input[name="email"], input[placeholder*="email" i]', 'info@newhollandfinancial.com').catch(()=>{});
    await page.fill('input[type="password"], input[name="password"], input[placeholder*="password" i]', 'NewHollandAdmin@2025').catch(()=>{});
    await page.click('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Login")').catch(()=>{});
    
    await page.waitForTimeout(3000); 
    await page.screenshot({ path: '/Users/newholland/1234567/audit_tracking_1_post_login.png' });
    console.log("Login submitted, current URL:", page.url());

    console.log("2. Navigating to Logistics Hub...");
    await page.goto('http://127.0.0.1:3020/crm/logistics', { waitUntil: 'networkidle', timeout: 30000 });
    
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/Users/newholland/1234567/audit_tracking_2_logistics.png' });
    
    let dispatchBtns = page.locator('button:has-text("Dispatch & Track Driver")');
    let btnCount = await dispatchBtns.count();
    console.log(`Found ${btnCount} "Dispatch & Track Driver" buttons.`);
    
    if (btnCount === 0) {
      console.log("No available loads found. Going to Post Load...");
      await page.goto('http://127.0.0.1:3020/crm/logistics/post-load');
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/Users/newholland/1234567/audit_tracking_3_post_load.png' });
      
      await page.fill('input[placeholder*="origin" i], input[name*="origin" i], label:has-text("Origin") + input', 'Chicago, IL').catch(()=>{});
      await page.fill('input[placeholder*="destination" i], input[name*="destination" i], label:has-text("Destination") + input', 'Dallas, TX').catch(()=>{});
      
      const submitLoad = page.locator('button:has-text("Submit"), button:has-text("Create Load"), button:has-text("Post Load")').first();
      if (await submitLoad.isVisible()) {
        await submitLoad.click();
        await page.waitForTimeout(3000);
      }
      
      await page.goto('http://127.0.0.1:3020/crm/logistics');
      await page.waitForTimeout(2000);
      dispatchBtns = page.locator('button:has-text("Dispatch & Track Driver")');
      btnCount = await dispatchBtns.count();
      console.log(`After posting, found ${btnCount} "Dispatch & Track Driver" buttons.`);
    }

    if (btnCount > 0) {
      console.log("3. Clicking Dispatch & Track Driver...");
      await dispatchBtns.first().click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: '/Users/newholland/1234567/audit_tracking_4_dispatch_modal.png' });
      
      console.log("4. Inputting driver email/phone...");
      await page.fill('input[type="email"], input[placeholder*="email" i]', 'test-driver@newhollandfinancial.com').catch(()=>{});
      await page.fill('input[type="tel"], input[placeholder*="phone" i]', '555-555-5555').catch(()=>{});
      
      await page.click('button:has-text("Send Tracking Link"), button:has-text("Generate Link")').catch(()=>{});
      await page.waitForTimeout(2000);
      await page.screenshot({ path: '/Users/newholland/1234567/audit_tracking_5_link_generated.png' });
      
      const pageText = await page.evaluate(() => document.body.innerText);
      const trackUrlMatch = pageText.match(/https?:\/\/[^\s]+track\/[a-zA-Z0-9_-]+/);
      let trackingUrl = trackUrlMatch ? trackUrlMatch[0] : null;
      
      if (!trackingUrl) {
        trackingUrl = await page.evaluate(() => {
          const inputs = Array.from(document.querySelectorAll('input, textarea'));
          const trackInput = inputs.find(i => typeof i.value === 'string' && i.value.includes('track/'));
          return trackInput ? trackInput.value : null;
        });
      }
      
      if (!trackingUrl) {
         trackingUrl = await page.evaluate(() => {
            const links = Array.from(document.querySelectorAll('a'));
            const trackLink = links.find(a => typeof a.href === 'string' && a.href.includes('track/'));
            return trackLink ? trackLink.href : null;
         });
      }

      console.log(`Extracted Tracking URL: ${trackingUrl}`);
      
      if (trackingUrl) {
        console.log("5. Navigating to Tracking URL...");
        
        // rewrite newhollandfinancial.com to localhost:3020
        let finalUrl = trackingUrl;
        if (trackingUrl.includes('newhollandfinancial.com')) {
           finalUrl = trackingUrl.replace('https://newhollandfinancial.com', 'http://127.0.0.1:3020');
        } else if (trackingUrl.startsWith('/')) {
           finalUrl = `http://127.0.0.1:3020${trackingUrl}`;
        }

        await page.goto(finalUrl, { waitUntil: 'networkidle', timeout: 30000 }).catch(async (e) => {
           console.log("Could not navigate to finalUrl", e);
        });
        
        await page.waitForTimeout(3000);
        await page.screenshot({ path: '/Users/newholland/1234567/audit_tracking_6_tracking_console.png' });
        
        console.log("6. Verifying Live Tracking Console...");
        const mapExists = await page.locator('.leaflet-container').count();
        console.log(`Leaflet Map Initialized: ${mapExists > 0}`);
        
        const addressText = await page.evaluate(() => document.body.innerText.includes('Pickup') || document.body.innerText.includes('Delivery') || document.body.innerText.includes('Chicago') || document.body.innerText.includes('Dallas'));
        console.log(`Pickup/Delivery details displayed: ${addressText}`);

        const startBtn = page.locator('button:has-text("Start Live GPS Stream")');
        if (await startBtn.isVisible()) {
          console.log("Clicking Start Live GPS Stream...");
          await startBtn.click();
          await page.waitForTimeout(5000);
          console.log(`GPS Pings Detected: ${gpsPings}`);
        } else {
          console.log("Start Live GPS Stream button not found.");
        }
        await page.screenshot({ path: '/Users/newholland/1234567/audit_tracking_7_after_stream.png' });
      } else {
        console.log("Could not find generated tracking URL.");
      }
    } else {
      console.log("Could not proceed: no available loads and couldn't create one.");
    }
    
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    await browser.close();
    console.log("Audit complete.");
  }
})();
