import { chromium } from 'playwright-core';
import fs from 'fs';
import path from 'path';

const routes = [
  { name: 'leads', url: 'http://localhost:3004/crm/leads' },
  { name: 'dashboard', url: 'http://localhost:3004/crm/dashboard' },
  { name: 'profile', url: 'http://localhost:3004/crm/profile' }
];

const auditResults = [];

(async () => {
  console.log("================ STARTING LIVE BROWSER AUDIT FOR TAB3D BANNERS ================");

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

  // 1. Initial navigation & setting nhfg_mock_user_id to admin-main
  console.log("\n--- STEP 1: Setting nhfg_mock_user_id = 'admin-main' ---");
  await page.goto('http://localhost:3004/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.evaluate(() => {
    localStorage.removeItem('nhfg_access_token');
    localStorage.removeItem('nhfg_refresh_token');
    localStorage.setItem('nhfg_mock_user_id', 'admin-main');
  });

  for (const route of routes) {
    console.log(`\n================ AUDITING ${route.name.toUpperCase()} (${route.url}) ================`);
    await page.goto(route.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Check maintenance banner visibility
    const maintenanceBannerVisible = await page.evaluate(() => {
      const banner = document.querySelector('.fixed.top-0.left-0.right-0.z-\\[110\\]');
      if (!banner) return false;
      const rect = banner.getBoundingClientRect();
      return rect.height > 0 && window.getComputedStyle(banner).display !== 'none';
    });

    // Check Tab3DBanner cards
    const bannerEvaluation = await page.evaluate(async () => {
      const cards = Array.from(document.querySelectorAll('.grid > div.relative.overflow-hidden.flex.items-center.justify-between'));
      
      const cardDetails = [];
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const cardRect = card.getBoundingClientRect();
        
        // Left text content block
        const textContainer = card.querySelector('div.relative.z-10.flex-1');
        const textRect = textContainer ? textContainer.getBoundingClientRect() : null;
        
        // Right levitating emoji badge block
        const emojiBadge = card.querySelector('div.relative.z-10.flex-shrink-0');
        const emojiRect = emojiBadge ? emojiBadge.getBoundingClientRect() : null;
        
        // Overlap check between text container and emoji badge
        let isOverlapping = false;
        if (textRect && emojiRect) {
          isOverlapping = (textRect.right > emojiRect.left) && (textRect.left < emojiRect.right);
        }

        // Emoji badge positioning check (should be on far right inside card)
        let isFarRight = false;
        if (emojiRect && cardRect) {
          const emojiCenter = emojiRect.left + emojiRect.width / 2;
          const cardCenter = cardRect.left + cardRect.width / 2;
          isFarRight = emojiCenter > cardCenter;
        }

        // Check motion levitation transform over time
        const transform1 = emojiBadge ? window.getComputedStyle(emojiBadge).transform : '';
        await new Promise(r => setTimeout(r, 600));
        const transform2 = emojiBadge ? window.getComputedStyle(emojiBadge).transform : '';
        const isLevitating = transform1 !== transform2 || (emojiBadge && (emojiBadge.getAttribute('style') || '').includes('transform'));

        cardDetails.push({
          index: i,
          cardWidth: cardRect.width,
          cardHeight: cardRect.height,
          textRight: textRect ? textRect.right : 0,
          emojiLeft: emojiRect ? emojiRect.left : 0,
          isOverlapping,
          isFarRight,
          isLevitating,
          emojiText: emojiBadge ? emojiBadge.textContent.trim() : ''
        });
      }

      return {
        cardCount: cards.length,
        cardDetails
      };
    });

    const screenshotPath = `/Users/newholland/1234567/audit_tab3d_${route.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${screenshotPath}`);

    const routeResult = {
      route: route.name,
      url: route.url,
      maintenanceBannerVisible,
      cardCount: bannerEvaluation.cardCount,
      cards: bannerEvaluation.cardDetails,
      screenshot: screenshotPath
    };

    console.log(`Audit Summary for ${route.name}:`);
    console.log(`- Maintenance Banner Visible: ${maintenanceBannerVisible}`);
    console.log(`- Tab3DBanner Card Count: ${bannerEvaluation.cardCount}`);
    bannerEvaluation.cardDetails.forEach((c, idx) => {
      console.log(`  Card #${idx + 1} (${c.emojiText}): Overlap=${c.isOverlapping ? 'FAIL' : 'CLEAN (0 OVERLAP)'}, Positioned Far Right=${c.isFarRight ? 'YES' : 'NO'}, Levitation Active=${c.isLevitating ? 'YES' : 'NO'}`);
    });

    auditResults.push(routeResult);
  }

  await browser.close();

  console.log("\n================ ALL AUDITS COMPLETED SUCCESSFULLY ================");
  console.log(JSON.stringify(auditResults, null, 2));
})();
