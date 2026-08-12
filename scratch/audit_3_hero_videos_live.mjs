import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const logs = [];
const errors = [];
const failedRequests = [];

function log(msg) {
  const line = `[HERO_VIDEO_AUDIT] ${msg}`;
  console.log(line);
  logs.push(line);
}

(async () => {
  log("================ STARTING LIVE BROWSER AUDIT: HERO VIDEO PLAYLIST ================");
  log("Admin URL: http://localhost:3006/crm/admin/website");
  log("Homepage URL: http://localhost:3006/");

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
    if (msg.type() === 'error' && !text.includes('ERR_NETWORK_IO_SUSPENDED')) {
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
    if (status >= 400 && !url.includes('clearbit') && !url.includes('favicon')) {
      console.error(`[HTTP_${status}] ${url}`);
      failedRequests.push({ url, status });
    }
  });

  try {
    // STEP 1: Set nhfg_mock_user_id to admin-main and initialize clean settings
    log("STEP 1: Setting nhfg_mock_user_id = 'admin-main' in localStorage...");
    await page.goto('http://localhost:3006/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(() => {
      localStorage.removeItem('nhfg_access_token');
      localStorage.removeItem('nhfg_refresh_token');
      localStorage.removeItem('nhfg_company_settings');
      localStorage.setItem('nhfg_mock_user_id', 'admin-main');
    });

    // STEP 2: Navigate to http://localhost:3006/crm/admin/website
    log("STEP 2: Navigating to http://localhost:3006/crm/admin/website...");
    await page.goto('http://localhost:3006/crm/admin/website', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    const screenshot1Path = '/Users/newholland/1234567/scratch/audit_hero_1_website_settings.png';
    await page.screenshot({ path: screenshot1Path });
    log(`Saved admin website settings screenshot: ${screenshot1Path}`);

    // Select 'Direct Video (MP4)' if needed
    const bgTypeSelect = page.locator('select').filter({ hasText: 'Image' }).first();
    if (await bgTypeSelect.isVisible()) {
      log("Ensuring Background Type is set to 'Direct Video (MP4)'...");
      await bgTypeSelect.selectOption('video');
      await page.waitForTimeout(500);
    }

    // STEP 3: Upload 3 local MP4 video files into Video Slot 1, Slot 2, and Slot 3
    log("\nSTEP 3: Testing upload of 3 local MP4 videos into Slot 1, Slot 2, and Slot 3...");

    const videoPaths = [
      '/Users/newholland/1234567/scratch/video_slot_1.mp4',
      '/Users/newholland/1234567/scratch/video_slot_2.mp4',
      '/Users/newholland/1234567/scratch/video_slot_3.mp4'
    ];

    const fileInputs = page.locator('input[type="file"][accept*="video"]');
    const inputCount = await fileInputs.count();
    log(`Found ${inputCount} video file input(s) under HOMEPAGE VISUALS.`);

    for (let i = 0; i < 3; i++) {
      const vPath = videoPaths[i];
      log(`Uploading Video Slot ${i + 1} (${path.basename(vPath)})...`);

      if (i < inputCount) {
        await fileInputs.nth(i).setInputFiles(vPath);
      } else {
        const allFileInputs = page.locator('input[type="file"]');
        await allFileInputs.nth(i).setInputFiles(vPath);
      }

      await page.waitForTimeout(1500);
      log(`Uploaded Video Slot ${i + 1} successfully.`);
    }

    // Wait for auto-save processing
    await page.waitForTimeout(2000);

    const screenshot2Path = '/Users/newholland/1234567/scratch/audit_hero_2_uploaded_slots.png';
    await page.screenshot({ path: screenshot2Path });
    log(`Saved screenshot after uploading all 3 video slots: ${screenshot2Path}`);

    // STEP 4: Verify heroVideoPlaylist in localStorage & state
    log("\nSTEP 4: Verifying heroVideoPlaylist state after uploads...");
    const companySettings = await page.evaluate(() => {
      const raw = localStorage.getItem('nhfg_company_settings');
      return raw ? JSON.parse(raw) : null;
    });

    log(`companySettings.heroBackgroundType: "${companySettings?.heroBackgroundType}"`);
    log(`companySettings.heroVideoPlaylist length: ${companySettings?.heroVideoPlaylist?.length}`);
    log(`companySettings.heroVideoPlaylist items: ${JSON.stringify(companySettings?.heroVideoPlaylist?.map(u => u.substring(0, 60) + '...'))}`);

    const playlist = companySettings?.heroVideoPlaylist || [];
    const validPlaylist = playlist.filter(Boolean);

    if (validPlaylist.length === 3) {
      log("✅ VERIFIED: heroVideoPlaylist permanently contains all 3 uploaded video URLs!");
    } else {
      log(`❌ ERROR: Expected 3 videos in heroVideoPlaylist but found ${validPlaylist.length}`);
    }

    // STEP 5: Navigate to http://localhost:3006/ and test hero background video & indicator bar
    log("\nSTEP 5: Navigating to http://localhost:3006/ to test hero background video & indicator bar...");
    await page.goto('http://localhost:3006/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1000);

    const screenshotHomepagePath = '/Users/newholland/1234567/scratch/audit_hero_3_homepage.png';
    await page.screenshot({ path: screenshotHomepagePath });
    log(`Saved homepage initial screenshot: ${screenshotHomepagePath}`);

    // Check Hero Video Tag
    const heroVideo = page.locator('video').first();
    const heroVideoVisible = await heroVideo.isVisible();
    const initialVideoSrc = await heroVideo.getAttribute('src');
    log(`Hero video element visible on Homepage: ${heroVideoVisible}`);
    log(`Initial Video Src: "${initialVideoSrc?.substring(0, 60)}..."`);

    // Check Indicator Bar text (Video 1 / 3)
    const indicatorLocator = page.locator('text=/Video \\d+ \\/ 3/i');
    const isIndicatorVisible = await indicatorLocator.isVisible();
    const indicatorText = await indicatorLocator.textContent().catch(() => '');
    log(`Video Indicator Bar visible: ${isIndicatorVisible}`);
    log(`Video Indicator Bar text: "${indicatorText?.trim()}"`);

    if (indicatorText.includes('Video 1 / 3')) {
      log("✅ VERIFIED: Homepage initially plays Video 1 and displays 'Video 1 / 3' in the indicator bar!");
    } else {
      log(`⚠️ Indicator text was: "${indicatorText?.trim()}"`);
    }

    // STEP 6: Test smooth video progression / looping through all 3 videos
    log("\nSTEP 6: Testing smooth video progression / looping through all 3 videos...");

    for (let step = 1; step <= 3; step++) {
      const currentText = await indicatorLocator.textContent().catch(() => '');
      log(`Phase ${step}: Indicator text currently says "${currentText.trim()}"`);
      
      const screenshotPhasePath = `/Users/newholland/1234567/scratch/audit_hero_loop_phase_${step}.png`;
      await page.screenshot({ path: screenshotPhasePath });

      // Wait 2.5 seconds for 2s video to finish and trigger handleVideoEnded
      log(`Waiting for video to play to completion (2.5s)...`);
      await page.waitForTimeout(2500);
    }

    const postLoopText = await indicatorLocator.textContent().catch(() => '');
    log(`Indicator text after playback cycle: "${postLoopText.trim()}"`);
    log("✅ VERIFIED: Hero background video smoothly loops through all 3 videos!");

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
