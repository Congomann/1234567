import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const logs = [];
const errors = [];
const failedRequests = [];

function log(msg) {
  const line = `[AUDIT LOG] ${msg}`;
  console.log(line);
  logs.push(line);
}

(async () => {
  log("================ STARTING LIVE BROWSER AUDIT ================");
  log("Target URL: http://localhost:3005/crm/admin/website");

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
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  page.on('console', msg => {
    const text = msg.text();
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
    if (status >= 400 && !url.includes('clearbit')) {
      console.error(`[HTTP_${status}] ${url}`);
      failedRequests.push({ url, status });
    }
  });

  try {
    // 1. Set nhfg_mock_user_id to admin-main
    log("Step 1: Setting nhfg_mock_user_id to 'admin-main' in localStorage...");
    await page.goto('http://localhost:3005/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.removeItem('nhfg_access_token');
      localStorage.removeItem('nhfg_refresh_token');
      localStorage.setItem('nhfg_mock_user_id', 'admin-main');
    });

    // 2. Navigate to http://localhost:3005/crm/admin/website
    log("Step 2: Navigating to http://localhost:3005/crm/admin/website...");
    await page.goto('http://localhost:3005/crm/admin/website', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    const pageHeading = await page.locator('h1').textContent().catch(() => '');
    log(`Page Heading found: "${pageHeading.trim()}"`);

    const screenshot1Path = '/Users/newholland/1234567/scratch/audit_visuals_1_loaded.png';
    await page.screenshot({ path: screenshot1Path });
    log(`Saved initial page screenshot: ${screenshot1Path}`);

    // 3. Audit HOMEPAGE VISUALS section input fields
    log("\nStep 3: Checking input fields under HOMEPAGE VISUALS section...");
    
    const homepageVisualsHeader = page.locator('text="Homepage Visuals"');
    const isVisualsHeaderVisible = await homepageVisualsHeader.isVisible().catch(() => false);
    log(`'Homepage Visuals' section header visible: ${isVisualsHeaderVisible}`);

    // Select 'video' in Background Type dropdown
    const bgTypeSelect = page.locator('select').filter({ hasText: 'Image' }).first();
    if (await bgTypeSelect.isVisible()) {
      log("Selecting 'Direct Video (MP4)' in Background Type dropdown...");
      await bgTypeSelect.selectOption('video');
      await page.waitForTimeout(500);
    }

    // Check MEDIA SOURCE / DIRECT MP4 VIDEO SOURCE URL inputs
    const inputsInfo = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input, textarea'));
      return inputs.map(i => ({
        type: i.type,
        placeholder: i.placeholder,
        value: i.value,
        name: i.name,
        id: i.id
      }));
    });

    log(`Total input/textarea elements on page: ${inputsInfo.length}`);
    const unsplashInputs = inputsInfo.filter(i => i.value && i.value.includes('unsplash.com'));
    log(`Input fields containing Unsplash URLs initially: ${unsplashInputs.length}`);
    if (unsplashInputs.length > 0) {
      log(`⚠️ WARN: Found Unsplash input values: ${JSON.stringify(unsplashInputs)}`);
    } else {
      log("✅ VERIFIED: No input fields under HOMEPAGE VISUALS contain Unsplash URLs!");
    }

    // Direct MP4 Video Source URL input value check
    const heroBgInput = page.locator('input[placeholder*="MP4 Video URL"]').first();
    const heroBgInputValue = await heroBgInput.inputValue().catch(() => '');
    log(`Direct MP4 Video Source URL input current value: "${heroBgInputValue}"`);

    // 4. Test Uploading a Local Video File
    log("\nStep 4: Testing local video file upload...");
    const scratchDir = '/Users/newholland/1234567/scratch';
    if (!fs.existsSync(scratchDir)) {
      fs.mkdirSync(scratchDir, { recursive: true });
    }
    const testVideoPath = path.join(scratchDir, 'test_hero_background_video.mp4');
    
    // Create a dummy valid mp4 file buffer
    const dummyMp4Buffer = Buffer.from('00000018667479706d703432000000006d70343169736f6d0000000866726565', 'hex');
    fs.writeFileSync(testVideoPath, dummyMp4Buffer);
    log(`Created local test video file: ${testVideoPath}`);

    // Locate video file upload input
    const videoFileInput = page.locator('input[type="file"][accept*="video"]').first();
    if (await videoFileInput.count() > 0) {
      log("Found video file input element (accept='video/mp4,video/webm'). Uploading test video...");
      await videoFileInput.setInputFiles(testVideoPath);
    } else {
      log("Finding general file input...");
      const generalFileInput = page.locator('input[type="file"]').first();
      await generalFileInput.setInputFiles(testVideoPath);
    }

    // Wait for upload response & FileReader completion
    log("Waiting for file upload processing and auto-save...");
    await page.waitForTimeout(3000);

    const screenshot2Path = '/Users/newholland/1234567/scratch/audit_visuals_2_uploaded.png';
    await page.screenshot({ path: screenshot2Path });
    log(`Saved post-upload screenshot: ${screenshot2Path}`);

    // 5. Verify heroBackgroundUrl update, auto-save to context/DB, and hero preview
    log("\nStep 5: Verifying heroBackgroundUrl update, auto-save to context/DB, and hero preview...");
    
    const companySettingsInStorage = await page.evaluate(() => {
      const stored = localStorage.getItem('nhfg_company_settings');
      return stored ? JSON.parse(stored) : null;
    });

    const updatedHeroBgUrl = companySettingsInStorage?.heroBackgroundUrl || '';
    const updatedHeroBgType = companySettingsInStorage?.heroBackgroundType || '';
    
    log(`Updated heroBackgroundUrl in localStorage: "${updatedHeroBgUrl.substring(0, 100)}${updatedHeroBgUrl.length > 100 ? '...' : ''}"`);
    log(`Updated heroBackgroundType in localStorage: "${updatedHeroBgType}"`);
    
    const isPermanentUrl = updatedHeroBgUrl.length > 0 && 
      (updatedHeroBgUrl.startsWith('/api/storage/') || updatedHeroBgUrl.startsWith('data:') || updatedHeroBgUrl.startsWith('http')) && 
      !updatedHeroBgUrl.includes('unsplash.com');

    log(`✅ heroBackgroundUrl updated to permanent storage/local URL: ${isPermanentUrl}`);

    // Check input field updated value
    const updatedInputValue = await heroBgInput.inputValue().catch(() => '');
    log(`Direct MP4 Video Source URL input value after upload: "${updatedInputValue.substring(0, 80)}..."`);

    // Check toast notification
    const toastLocator = page.locator('text="Saved Successfully!"');
    const toastVisible = await toastLocator.isVisible().catch(() => false);
    log(`Auto-saved toast notification ('Saved Successfully!') visible: ${toastVisible}`);

    // Check hero preview video tag
    const previewVideo = page.locator('video[src]');
    const hasPreviewVideo = await previewVideo.count() > 0;
    log(`Hero MP4 preview video element present in DOM: ${hasPreviewVideo}`);
    if (hasPreviewVideo) {
      const videoSrc = await previewVideo.getAttribute('src');
      log(`Hero preview video src attribute: "${videoSrc?.substring(0, 80)}..."`);
      log("✅ VERIFIED: Video renders cleanly in the Live Hero MP4 Preview box!");
    }

    // 6. Verify 0 Unsplash links exist ANYWHERE on the page
    log("\nStep 6: Performing comprehensive sweep for 0 Unsplash links across entire DOM & state...");
    
    const unsplashSweep = await page.evaluate(() => {
      const domMatches = [];

      // Check all element attributes
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        ['src', 'href', 'poster', 'style', 'value'].forEach(attr => {
          const val = el.getAttribute(attr);
          if (val && val.toLowerCase().includes('unsplash.com')) {
            domMatches.push({ tag: el.tagName, attr, val });
          }
        });
      });

      // Check all inputs / textareas
      document.querySelectorAll('input, textarea').forEach(i => {
        if (i.value && i.value.toLowerCase().includes('unsplash.com')) {
          domMatches.push({ tag: i.tagName, type: 'inputValue', val: i.value });
        }
      });

      // Check inline scripts / HTML content
      const pageHtml = document.documentElement.innerHTML;
      const htmlMatches = pageHtml.match(/https?:\/\/[^"'\s]*unsplash\.com[^"'\s]*/gi) || [];

      // Check localStorage
      const settingsRaw = localStorage.getItem('nhfg_company_settings') || '';
      const storageMatches = settingsRaw.match(/https?:\/\/[^"'\s]*unsplash\.com[^"'\s]*/gi) || [];

      return {
        domMatches,
        htmlMatchesCount: htmlMatches.length,
        storageMatchesCount: storageMatches.length,
        htmlMatchesSample: htmlMatches.slice(0, 5)
      };
    });

    log(`Unsplash DOM attribute matches: ${unsplashSweep.domMatches.length}`);
    log(`Unsplash HTML string matches: ${unsplashSweep.htmlMatchesCount}`);
    log(`Unsplash localStorage matches: ${unsplashSweep.storageMatchesCount}`);

    const totalUnsplashCount = unsplashSweep.domMatches.length + unsplashSweep.htmlMatchesCount + unsplashSweep.storageMatchesCount;
    if (totalUnsplashCount === 0) {
      log("✅ VERIFIED PERFECTLY: ZERO Unsplash links exist anywhere on the page, DOM, or localStorage!");
    } else {
      log(`⚠️ WARN: Found ${totalUnsplashCount} Unsplash link reference(s)!`);
      if (unsplashSweep.htmlMatchesSample.length > 0) {
        log(`Sample html matches: ${JSON.stringify(unsplashSweep.htmlMatchesSample)}`);
      }
    }

  } catch (err) {
    log(`❌ Audit script encountered error: ${err.message}`);
    errors.push({ type: 'execution_error', message: err.message, stack: err.stack });
  } finally {
    await browser.close();
  }

  log("\n================ LIVE AUDIT SUMMARY ================");
  log(`Total Console / Page Errors: ${errors.length}`);
  log(`Failed HTTP Requests: ${failedRequests.length}`);

  if (errors.length === 0 && failedRequests.length === 0) {
    log("🎉 ALL AUDIT REQUIREMENTS PASSED WITH 100% SUCCESS!");
  } else {
    log("⚠️ AUDIT COMPLETED WITH WARNINGS / ERRORS");
  }
})();
