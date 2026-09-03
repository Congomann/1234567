const fs = require('fs');
const path = require('path');

const report = {
  checks: [],
  discrepancies: [],
  stressTests: [],
  verdict: 'PENDING'
};

function check(title, fn) {
  try {
    const res = fn();
    if (res.pass) {
      report.checks.push({ title, status: 'PASS', details: res.details });
    } else {
      report.checks.push({ title, status: 'FAIL', details: res.details });
      report.discrepancies.push({ title, reason: res.details });
    }
  } catch (e) {
    report.checks.push({ title, status: 'ERROR', details: e.message + '\n' + e.stack });
    report.discrepancies.push({ title, reason: e.message });
  }
}

// 1. Check frontend package dependencies
check('Frontend stack versions in package.json', () => {
  const pkg = JSON.parse(fs.readFileSync('/Users/newholland/1234567/package.json', 'utf8'));
  const checks = [
    pkg.dependencies['react'] === '18.2.0',
    pkg.dependencies['react-dom'] === '18.2.0',
    pkg.dependencies['react-router-dom'] === '6.22.3',
    pkg.devDependencies['vite'] === '^6.2.0',
    pkg.devDependencies['@vitejs/plugin-react'] === '^5.0.0',
    pkg.dependencies['framer-motion'] === '^12.35.0',
    pkg.dependencies['lucide-react'] === '0.344.0',
    pkg.dependencies['recharts'] === '2.12.2',
    pkg.dependencies['clsx'] === '^2.1.0',
    pkg.dependencies['tailwind-merge'] === '^2.2.1',
    pkg.dependencies['jspdf'] === '2.5.1',
    pkg.dependencies['jspdf-autotable'] === '3.8.2',
    pkg.dependencies['html-to-image'] === '1.11.11',
    pkg.dependencies['date-fns'] === '^4.1.0',
    pkg.dependencies['@supabase/supabase-js'] === '^2.110.8',
    pkg.dependencies['react-plaid-link'] === '^4.1.1'
  ];
  return {
    pass: checks.every(Boolean),
    details: { dependencies: pkg.dependencies, devDependencies: pkg.devDependencies }
  };
});

// 2. Check Backend Server LOC and Express version
check('Backend runtime & Express version', () => {
  const pkg = JSON.parse(fs.readFileSync('/Users/newholland/1234567/package.json', 'utf8'));
  const server = fs.readFileSync('/Users/newholland/1234567/backend/server.cjs', 'utf8');
  const loc = server.split('\n').length;
  return {
    pass: pkg.dependencies['express'] === '^5.2.1' && loc === 5539,
    details: { expressVersion: pkg.dependencies['express'], linesOfCode: loc }
  };
});

// 3. Check SignalWire SDK absence & Twilio presence
check('SignalWire SDKs not installed & Twilio installed', () => {
  const pkg = JSON.parse(fs.readFileSync('/Users/newholland/1234567/package.json', 'utf8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
  const hasSW = Object.keys(allDeps).some(d => d.startsWith('@signalwire'));
  const hasTwilio = pkg.dependencies['twilio'] === '^5.12.2';
  return {
    pass: !hasSW && hasTwilio,
    details: { hasSW, twilioVersion: pkg.dependencies['twilio'] }
  };
});

// 4. Check Database 55 Tables existence in schema files
check('Database Schema 55 tables verification', () => {
  const schemaFiles = [
    '/Users/newholland/1234567/backend/schema.sql',
    '/Users/newholland/1234567/backend/supabase_schema.sql',
    '/Users/newholland/1234567/backend/chat_schema.sql',
    '/Users/newholland/1234567/backend/supabase_setup.sql',
    '/Users/newholland/1234567/backend/migrations/marketing_schema.sql',
    '/Users/newholland/1234567/backend/migrations/signalwire_schema.sql'
  ];
  const tables = new Set();
  schemaFiles.forEach(f => {
    if (fs.existsSync(f)) {
      const sql = fs.readFileSync(f, 'utf8');
      const matches = sql.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi);
      for (const m of matches) tables.add(m[1].toLowerCase());
    }
  });
  const server = fs.readFileSync('/Users/newholland/1234567/backend/server.cjs', 'utf8');
  const serverMatches = server.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi);
  for (const m of serverMatches) tables.add(m[1].toLowerCase());

  // Tables cited in the document
  const citedTables = [
    'users', 'activation_tokens', 'refresh_tokens', 'advisor_applications', 'advisor_extensions',
    'advisor_billing', 'advisor_specialties', 'lead_types', 'routing_state', 'leads', 'clients',
    'applications', 'transactions', 'properties', 'portfolios', 'logistics_loads', 'telephony_calls',
    'telephony_sms', 'interaction_history', 'case_notes', 'chat_channels', 'chat_channel_members',
    'chat_messages', 'chat_read_receipts', 'plaid_items', 'bank_verifications', 'verification_links',
    'plaid_usage_logs', 'bank_accounts', 'balances', 'transactions_plaid', 'risk_scores',
    'commission_statements', 'commission_reconciliations', 'documents', 'tasks', 'events',
    'notifications', 'user_preferences', 'company_settings', 'landing_pages', 'nurture_sequences',
    'marketing_campaigns', 'marketing_audiences', 'payment_transactions', 'email_sends',
    'social_integrations', 'workflow_automations', 'integration_config', 'integration_logs',
    'access_logs', 'resources', 'testimonials', 'callbacks', 'analytics_page_views'
  ];

  const missing = citedTables.filter(t => !tables.has(t));
  return {
    pass: missing.length === 0,
    details: { totalFound: tables.size, missingCited: missing }
  };
});

// 5. Check SignalWire Credentials in backend and env files
check('SignalWire credentials in codebase & .env.vercel.production', () => {
  const envProd = fs.readFileSync('/Users/newholland/1234567/.env.vercel.production', 'utf8');
  const swCjs = fs.readFileSync('/Users/newholland/1234567/backend/routes/signalwire.cjs', 'utf8');
  const hasSpace = envProd.includes('newhollandfinancialgroup.signalwire.com') && swCjs.includes('newhollandfinancialgroup.signalwire.com');
  const hasProj = envProd.includes('3b3475f1-9582-41fb-b2e2-7e6453821fb2') && swCjs.includes('3b3475f1-9582-41fb-b2e2-7e6453821fb2');
  const hasToken = envProd.includes('PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4') && swCjs.includes('PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4');
  const hasPhone = envProd.includes('+18885550199') && swCjs.includes('+18885550199');

  return {
    pass: hasSpace && hasProj && hasToken && hasPhone,
    details: { hasSpace, hasProj, hasToken, hasPhone }
  };
});

// 6. Check TelephonyHub.tsx components & operational tabs
check('TelephonyHub.tsx structure and implementation', () => {
  const content = fs.readFileSync('/Users/newholland/1234567/pages/crm/TelephonyHub.tsx', 'utf8');
  const hasSoftphoneTab = content.includes('activeTab === \'softphone\'') || content.includes('Corporate Softphone');
  const hasExtensionsTab = content.includes('activeTab === \'extensions\'') || content.includes('Advisor Extensions');
  const hasSmsTab = content.includes('activeTab === \'sms\'') || content.includes('2-Way SMS Inbox');
  const hasAiQualifierTab = content.includes('activeTab === \'ai-qualifier\'') || content.includes('AI Lead Qualifier');
  const hasLogsTab = content.includes('activeTab === \'logs\'') || content.includes('Call Recordings & AI Ratings Log');
  const hasFetchCall = content.includes('/api/signalwire/call');

  return {
    pass: hasSoftphoneTab && hasExtensionsTab && hasSmsTab && hasAiQualifierTab && hasLogsTab && hasFetchCall,
    details: { hasSoftphoneTab, hasExtensionsTab, hasSmsTab, hasAiQualifierTab, hasLogsTab, hasFetchCall }
  };
});

// 7. Check Hosting configuration files
check('Hosting & Deployment configs (vercel.json, render.yaml, keep-alive.yml)', () => {
  const vercel = JSON.parse(fs.readFileSync('/Users/newholland/1234567/vercel.json', 'utf8'));
  const render = fs.readFileSync('/Users/newholland/1234567/render.yaml', 'utf8');
  const keepAlive = fs.readFileSync('/Users/newholland/1234567/.github/workflows/keep-alive.yml', 'utf8');

  const hasVercelRewrite = vercel.rewrites && vercel.rewrites.some(r => r.source === '/api/(.*)' && r.destination === '/api/index.js');
  const hasRenderNode = render.includes('start:prod') && render.includes('node backend/server.cjs');
  const hasKeepAliveCron = keepAlive.includes('0 0 */2 * *') || keepAlive.includes('schedule');

  return {
    pass: hasVercelRewrite && hasRenderNode && hasKeepAliveCron,
    details: { hasVercelRewrite, hasRenderNode, hasKeepAliveCron }
  };
});

// 8. Check WebSocket & WebRTC implementation status
check('WebSocket server at /ws and WebRTC absence', () => {
  const server = fs.readFileSync('/Users/newholland/1234567/backend/server.cjs', 'utf8');
  const socketService = fs.readFileSync('/Users/newholland/1234567/services/socketService.ts', 'utf8');
  const hasWs = server.includes("WebSocket.Server({ server, path: '/ws' })");
  const hasSocketClient = socketService.includes('/ws');
  
  // Verify no WebRTC client SDK in package.json or source files
  const pkg = JSON.parse(fs.readFileSync('/Users/newholland/1234567/package.json', 'utf8'));
  const noSignalwireJs = !pkg.dependencies['@signalwire/js'];

  return {
    pass: hasWs && hasSocketClient && noSignalwireJs,
    details: { hasWs, hasSocketClient, noSignalwireJs }
  };
});

// 9. Lead Scoring implementation
check('Lead scoring algorithm in backend/server.cjs', () => {
  const server = fs.readFileSync('/Users/newholland/1234567/backend/server.cjs', 'utf8');
  const hasCalc = server.includes('function calculateLeadScore') || server.includes('const calculateLeadScore');
  return {
    pass: hasCalc,
    details: { hasCalc }
  };
});

// 10. Check Citations & Line Numbers Accuracy
check('Citations and Line Numbers Verification', () => {
  const checks = [];
  const serverLines = fs.readFileSync('/Users/newholland/1234567/backend/server.cjs', 'utf8').split('\n');
  const pkgLines = fs.readFileSync('/Users/newholland/1234567/package.json', 'utf8').split('\n');
  const schemaLines = fs.readFileSync('/Users/newholland/1234567/backend/schema.sql', 'utf8').split('\n');

  // Verify package.json lines
  // package.json:44-45 (react, react-dom)
  const p44_45 = pkgLines[43] + pkgLines[44];
  checks.push(p44_45.includes('react'));

  // backend/schema.sql users table line range
  const usersDef = schemaLines.slice(5, 27).join('\n');
  checks.push(usersDef.includes('CREATE TABLE IF NOT EXISTS users'));

  // backend/schema.sql leads table line range
  const leadsDef = schemaLines.slice(37, 72).join('\n');
  checks.push(leadsDef.includes('CREATE TABLE IF NOT EXISTS leads'));

  // backend/schema.sql clients table line range
  const clientsDef = schemaLines.slice(73, 93).join('\n');
  checks.push(clientsDef.includes('CREATE TABLE IF NOT EXISTS clients'));

  // backend/schema.sql telephony_calls table line range
  const callsDef = schemaLines.slice(451, 469).join('\n');
  checks.push(callsDef.includes('CREATE TABLE IF NOT EXISTS telephony_calls'));

  return {
    pass: checks.every(Boolean),
    details: { totalCitationsChecked: checks.length, allPassed: checks.every(Boolean) }
  };
});

fs.writeFileSync('/Users/newholland/1234567/.agents/challenger_m1_2/detailed_audit_checks.json', JSON.stringify(report, null, 2));
console.log('Detailed checks complete. Discrepancies:', report.discrepancies.length);
