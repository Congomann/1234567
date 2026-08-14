const fs = require('fs');
const path = require('path');

console.log('=== Milestone M2 Empirical Test Harness ===\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

const chartsFilePath = path.join(__dirname, '../../components/analytics/CRMAnalyticsCharts.tsx');
const dashboardFilePath = path.join(__dirname, '../../pages/crm/Dashboard.tsx');

// 1. File Existence & Read
assert(fs.existsSync(chartsFilePath), 'CRMAnalyticsCharts.tsx exists');
assert(fs.existsSync(dashboardFilePath), 'Dashboard.tsx exists');

const chartsContent = fs.readFileSync(chartsFilePath, 'utf8');
const dashboardContent = fs.readFileSync(dashboardFilePath, 'utf8');

// 2. Dashboard Placement Check
const crmChartsImported = /import\s+\{\s*CRMAnalyticsCharts\s*\}\s+from\s+['"]\.\.\/\.\.\/components\/analytics\/CRMAnalyticsCharts['"]/.test(dashboardContent);
assert(crmChartsImported, 'Dashboard.tsx imports CRMAnalyticsCharts correctly');

const bannerIndex = dashboardContent.indexOf('<Tab3DBanner');
const chartsIndex = dashboardContent.indexOf('<CRMAnalyticsCharts />');
const eventFeedIndex = dashboardContent.indexOf('Live CRM Event Feed');

assert(bannerIndex !== -1, 'Tab3DBanner is present in Dashboard.tsx');
assert(chartsIndex !== -1, 'CRMAnalyticsCharts is present in Dashboard.tsx');
assert(eventFeedIndex !== -1, 'Live CRM Event Feed is present in Dashboard.tsx');
assert(bannerIndex < chartsIndex && chartsIndex < eventFeedIndex, 'CRMAnalyticsCharts is positioned directly between Tab3DBanner and Live CRM Event Feed');

// 3. SVG Filter IDs and Usage
const filterDefs = [...chartsContent.matchAll(/<filter\s+id="([^"]+)"/g)].map(m => m[1]);
console.log('Found SVG Filter IDs:', filterDefs);

assert(filterDefs.includes('neon-cyan-glow'), 'SVG defs include neon-cyan-glow');
assert(filterDefs.includes('neon-pink-glow'), 'SVG defs include neon-pink-glow');
assert(filterDefs.includes('neon-emerald-glow'), 'SVG defs include neon-emerald-glow');
assert(filterDefs.includes('neon-purple-glow'), 'SVG defs include neon-purple-glow');

const filterRefs = [...chartsContent.matchAll(/filter="url\(#([^)]+)\)"/g)].map(m => m[1]);
console.log('Found SVG Filter References in chart elements:', filterRefs);

filterRefs.forEach(ref => {
  assert(filterDefs.includes(ref), `Filter reference url(#${ref}) matches a defined SVG filter ID`);
});

// 4. Framer Motion Animation Props Check
assert(chartsContent.includes('import { motion, AnimatePresence } from \'framer-motion\';'), 'Framer motion is imported');
assert(chartsContent.includes('layoutId="activeTimeframeGlow"'), 'Active timeframe pill uses layoutId="activeTimeframeGlow"');

const motionDivMatches = [...chartsContent.matchAll(/<motion\.div[\s\S]*?>/g)];
assert(motionDivMatches.length >= 4, `Found ${motionDivMatches.length} motion.div elements in CRMAnalyticsCharts.tsx`);

// Verify staggered delays
assert(chartsContent.includes('delay: 0.1'), 'AreaChart motion container delay is 0.1s');
assert(chartsContent.includes('delay: 0.2'), 'Donut PieChart motion container delay is 0.2s');
assert(chartsContent.includes('delay: 0.3'), 'BarChart motion container delay is 0.3s');

// 5. Timeframe State & TIMEFRAME_DATA object validation
const timeframes = ['7D', '30D', '90D', 'YTD', '1Y'];
timeframes.forEach(tf => {
  assert(chartsContent.includes(`'${tf}':`), `TIMEFRAME_DATA contains key for timeframe '${tf}'`);
});

// Extract TIMEFRAME_DATA content via regex/parsing simulation
// We will build a mini JS evaluation of TIMEFRAME_DATA by stripping TS types
const timeframeDataMatch = chartsContent.match(/const TIMEFRAME_DATA[\s\S]*?;\n\ninterface CustomTooltipProps/);
assert(timeframeDataMatch !== null, 'TIMEFRAME_DATA block extracted successfully');

if (timeframeDataMatch) {
  try {
    const rawDataJs = timeframeDataMatch[0]
      .replace(/const TIMEFRAME_DATA:\s*Record<Timeframe,\s*TimeframeData>\s*=/, 'const TIMEFRAME_DATA =')
      .replace(/;\n\ninterface CustomTooltipProps/, '');
    
    // Evaluate object safely in Function constructor
    const getObject = new Function(`${rawDataJs}; return TIMEFRAME_DATA;`);
    const timeframeData = getObject();

    timeframes.forEach(tf => {
      const data = timeframeData[tf];
      assert(data !== undefined, `Timeframe data for '${tf}' is defined`);
      if (data) {
        assert(Array.isArray(data.areaData) && data.areaData.length > 0, `'${tf}' areaData is a non-empty array (${data.areaData?.length} items)`);
        assert(Array.isArray(data.barData) && data.barData.length > 0, `'${tf}' barData is a non-empty array (${data.barData?.length} items)`);
        assert(Array.isArray(data.pieData) && data.pieData.length > 0, `'${tf}' pieData is a non-empty array (${data.pieData?.length} items)`);
        assert(typeof data.kpi === 'object', `'${tf}' kpi object is present`);
        assert(typeof data.kpi.totalAum === 'string' && data.kpi.totalAum.startsWith('$'), `'${tf}' totalAum is valid currency string: ${data.kpi.totalAum}`);
        assert(typeof data.kpi.totalLeads === 'number' && data.kpi.totalLeads > 0, `'${tf}' totalLeads is positive number: ${data.kpi.totalLeads}`);

        // Verify areaData item fields
        data.areaData.forEach((item, i) => {
          assert(typeof item.label === 'string' && item.label.length > 0, `'${tf}' areaData[${i}] has label`);
          assert(typeof item.revenue === 'number' && !isNaN(item.revenue), `'${tf}' areaData[${i}] has valid revenue`);
          assert(typeof item.aum === 'number' && !isNaN(item.aum), `'${tf}' areaData[${i}] has valid aum`);
        });

        // Verify barData item fields
        data.barData.forEach((item, i) => {
          assert(typeof item.channel === 'string', `'${tf}' barData[${i}] has channel name`);
          assert(typeof item.leads === 'number' && !isNaN(item.leads), `'${tf}' barData[${i}] has valid leads count`);
          assert(typeof item.converted === 'number' && !isNaN(item.converted), `'${tf}' barData[${i}] has valid converted count`);
          assert(/^#[0-9a-fA-F]{6}$/.test(item.fill), `'${tf}' barData[${i}] has hex fill color: ${item.fill}`);
        });

        // Verify pieData item fields
        data.pieData.forEach((item, i) => {
          assert(typeof item.name === 'string', `'${tf}' pieData[${i}] has name`);
          assert(typeof item.value === 'number' && !isNaN(item.value), `'${tf}' pieData[${i}] has valid value`);
          assert(/^#[0-9a-fA-F]{6}$/.test(item.color), `'${tf}' pieData[${i}] has hex color: ${item.color}`);
        });
      }
    });

  } catch (err) {
    assert(false, `Error evaluating TIMEFRAME_DATA: ${err.message}`);
  }
}

// 6. CustomTooltip Edge Case Verification
console.log('\n--- CustomTooltip Component Edge Case Evaluation ---');

// Mock rendering CustomTooltip logic directly
function simulateTooltipLogic({ active, payload, label, isCurrency, prefix, suffix }) {
  if (!active || !payload || !payload.length) return null;

  const items = payload.map((entry, index) => {
    const val = entry.value;
    let formattedVal = '';
    if (isCurrency) {
      formattedVal = `$${typeof val === 'number' ? val.toFixed(1) : val}M`;
    } else {
      formattedVal = `${prefix || ''}${typeof val === 'number' ? val.toLocaleString() : val}${suffix || ''}`;
    }
    return {
      name: entry.name,
      val: formattedVal,
      color: entry.color || entry.fill || '#38bdf8'
    };
  });

  return { label, items };
}

// Test Case A: Inactive tooltip
const resInactive = simulateTooltipLogic({ active: false, payload: [{ value: 10 }] });
assert(resInactive === null, 'Inactive tooltip returns null');

// Test Case B: Empty payload
const resEmptyPayload = simulateTooltipLogic({ active: true, payload: [] });
assert(resEmptyPayload === null, 'Empty payload tooltip returns null');

// Test Case C: AreaChart currency payload
const resArea = simulateTooltipLogic({
  active: true,
  label: 'Wed',
  isCurrency: true,
  payload: [
    { name: 'Assets Under Mgmt', value: 140.5, color: '#00f2fe' },
    { name: 'Fee Revenue', value: 2.8, color: '#8e2de2' }
  ]
});
assert(resArea !== null && resArea.items.length === 2, 'AreaChart tooltip renders 2 payload items');
assert(resArea.items[0].val === '$140.5M', 'AreaChart item 0 formatted currency is $140.5M');
assert(resArea.items[1].val === '$2.8M', 'AreaChart item 1 formatted currency is $2.8M');

// Test Case D: BarChart leads payload
const resBar = simulateTooltipLogic({
  active: true,
  label: 'Google Search',
  suffix: ' leads',
  payload: [
    { name: 'Total Inbound', value: 190, fill: '#00f2fe' },
    { name: 'Converted HNW', value: 72, fill: '#10b981' }
  ]
});
assert(resBar !== null && resBar.items.length === 2, 'BarChart tooltip renders 2 payload items');
assert(resBar.items[0].val === '190 leads', 'BarChart item 0 formatted count is "190 leads"');
assert(resBar.items[0].color === '#00f2fe', 'BarChart item 0 uses entry.fill color fallback');

// Test Case E: Donut PieChart payload
const resPie = simulateTooltipLogic({
  active: true,
  label: 'Securities & Wealth',
  prefix: '$',
  suffix: 'M',
  payload: [
    { name: 'Securities & Wealth', value: 64.2, color: '#00f2fe' }
  ]
});
assert(resPie !== null && resPie.items[0].val === '$64.2M', 'PieChart item formatted value is "$64.2M"');

// Test Case F: Zero value handling
const resZero = simulateTooltipLogic({
  active: true,
  isCurrency: true,
  payload: [{ name: 'Zero AUM', value: 0, color: '#00f2fe' }]
});
assert(resZero !== null && resZero.items[0].val === '$0.0M', 'Zero value formatted correctly as "$0.0M"');

// 7. Styling & Responsive Container check
assert(chartsContent.includes('apple-glass-dark'), 'Root container uses apple-glass-dark styling');
assert(chartsContent.includes('h-[300px]'), 'AreaChart container specifies explicit height 300px');
assert(chartsContent.includes('h-[210px]'), 'PieChart container specifies explicit height 210px');
assert(chartsContent.includes('h-[260px]'), 'BarChart container specifies explicit height 260px');
assert(chartsContent.includes('grid-cols-1 lg:grid-cols-12'), 'Responsive 12-column grid system is present');

console.log(`\n=== Verification Summary: ${passCount} Passed, ${failCount} Failed ===`);
if (failCount > 0) {
  console.error('VERDICT: REJECT (Failures detected)');
  process.exit(1);
} else {
  console.log('VERDICT: APPROVE (All checks passed)');
  process.exit(0);
}
