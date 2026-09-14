const fs = require('fs');

let content = fs.readFileSync('components/analytics/CRMAnalyticsCharts.tsx', 'utf8');

const replacement = `const TIMEFRAME_DATA: Record<Timeframe, TimeframeData> = {
  '7D': {
    areaData: [],
    barData: [],
    pieData: [],
    kpi: { totalAum: '$0', aumGrowth: '0%', totalLeads: 0, leadsGrowth: '0%', conversionRate: '0%' }
  },
  '30D': {
    areaData: [],
    barData: [],
    pieData: [],
    kpi: { totalAum: '$0', aumGrowth: '0%', totalLeads: 0, leadsGrowth: '0%', conversionRate: '0%' }
  },
  '90D': {
    areaData: [],
    barData: [],
    pieData: [],
    kpi: { totalAum: '$0', aumGrowth: '0%', totalLeads: 0, leadsGrowth: '0%', conversionRate: '0%' }
  },
  'YTD': {
    areaData: [],
    barData: [],
    pieData: [],
    kpi: { totalAum: '$0', aumGrowth: '0%', totalLeads: 0, leadsGrowth: '0%', conversionRate: '0%' }
  },
  '1Y': {
    areaData: [],
    barData: [],
    pieData: [],
    kpi: { totalAum: '$0', aumGrowth: '0%', totalLeads: 0, leadsGrowth: '0%', conversionRate: '0%' }
  }
};`;

// replace everything from `const TIMEFRAME_DATA: Record<Timeframe, TimeframeData> = {` to `};` right before `export const CRMAnalyticsCharts`
const regex = /const TIMEFRAME_DATA: Record<Timeframe, TimeframeData> = \{[\s\S]*?\n\};\n/m;
content = content.replace(regex, replacement + '\n');
fs.writeFileSync('components/analytics/CRMAnalyticsCharts.tsx', content);
console.log('Patched CRMAnalyticsCharts');
