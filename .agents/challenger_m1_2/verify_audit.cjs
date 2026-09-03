const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const results = {
  gitStatus: {},
  packages: {},
  filesChecked: {},
  databaseTables: {},
  envVariables: {},
  apiRoutes: {},
  codeCitations: {},
  summary: []
};

// 1. Git Status & Strict Read-Only Verification
try {
  const gitStatusOut = execSync('git status --porcelain', { cwd: '/Users/newholland/1234567', encoding: 'utf8' });
  const lines = gitStatusOut.split('\n').filter(Boolean);
  const modifiedNonAgentFiles = lines.filter(l => !l.includes('.agents/') && !l.includes('TELEPHONY_PHASE1_AUDIT_PLAN.md'));
  results.gitStatus = {
    cleanExceptDeliverableAndAgents: modifiedNonAgentFiles.length === 0,
    modifiedNonAgentFiles,
    totalEntries: lines.length,
    rawLines: lines
  };
} catch (e) {
  results.gitStatus = { error: e.message };
}

// 2. Package Manifest Verification
const pkg = JSON.parse(fs.readFileSync('/Users/newholland/1234567/package.json', 'utf8'));
const pkgLockExists = fs.existsSync('/Users/newholland/1234567/package-lock.json');
let pkgLockContent = '';
if (pkgLockExists) {
  pkgLockContent = fs.readFileSync('/Users/newholland/1234567/package-lock.json', 'utf8');
}

results.packages = {
  react: pkg.dependencies?.react,
  reactDom: pkg.dependencies?.['react-dom'],
  express: pkg.dependencies?.express,
  vite: pkg.devDependencies?.vite,
  typescript: pkg.devDependencies?.typescript,
  twilio: pkg.dependencies?.twilio,
  signalwirePackagesInPackageJson: Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter(k => k.includes('signalwire')),
  signalwireInLockfile: pkgLockContent.includes('@signalwire')
};

// 3. Schema & Tables Verification
const schemaFiles = [
  '/Users/newholland/1234567/backend/schema.sql',
  '/Users/newholland/1234567/backend/supabase_schema.sql',
  '/Users/newholland/1234567/backend/chat_schema.sql',
  '/Users/newholland/1234567/backend/supabase_setup.sql',
  '/Users/newholland/1234567/backend/migrations/marketing_schema.sql',
  '/Users/newholland/1234567/backend/migrations/signalwire_schema.sql'
];

const foundTables = new Set();
for (const sf of schemaFiles) {
  if (fs.existsSync(sf)) {
    const content = fs.readFileSync(sf, 'utf8');
    const matches = content.matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi);
    for (const m of matches) {
      foundTables.add(m[1].toLowerCase());
    }
  }
}

// Also check backend/server.cjs and routingEngine.cjs for dynamic/inline tables
const serverCjs = fs.readFileSync('/Users/newholland/1234567/backend/server.cjs', 'utf8');
const routingEngineCjs = fs.existsSync('/Users/newholland/1234567/backend/services/routingEngine.cjs') ? fs.readFileSync('/Users/newholland/1234567/backend/services/routingEngine.cjs', 'utf8') : '';

const serverMatches = (serverCjs + routingEngineCjs).matchAll(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)/gi);
for (const m of serverMatches) {
  foundTables.add(m[1].toLowerCase());
}

results.databaseTables = {
  totalTablesFound: foundTables.size,
  tableList: Array.from(foundTables).sort()
};

// 4. Check specific claims in AUDIT PLAN
const auditPlanContent = fs.readFileSync('/Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md', 'utf8');

// Check signalwire credentials cited
results.credentialsCheck = {
  spaceUrlInSignalwireCjs: serverCjs.includes('newhollandfinancialgroup.signalwire.com') || (fs.existsSync('/Users/newholland/1234567/backend/routes/signalwire.cjs') && fs.readFileSync('/Users/newholland/1234567/backend/routes/signalwire.cjs', 'utf8').includes('newhollandfinancialgroup.signalwire.com')),
  projectIdCited: auditPlanContent.includes('3b3475f1-9582-41fb-b2e2-7e6453821fb2'),
  apiTokenCited: auditPlanContent.includes('PT5b546759c1617e256c38864661f64f54fbe6b3f7e17b89e4'),
  phoneNumberCited: auditPlanContent.includes('+18885550199')
};

// Check backend server loc
const serverLoc = serverCjs.split('\n').length;
results.backendLoc = serverLoc;

// Check TelephonyHub loc
const telephonyHubContent = fs.readFileSync('/Users/newholland/1234567/pages/crm/TelephonyHub.tsx', 'utf8');
results.telephonyHubLoc = telephonyHubContent.split('\n').length;

// Check WebSocket mounting in backend/server.cjs
results.wsCheck = {
  hasWsServer: serverCjs.includes("WebSocket.Server({ server, path: '/ws' })") || serverCjs.includes("path: '/ws'"),
  socketServiceExists: fs.existsSync('/Users/newholland/1234567/services/socketService.ts')
};

// Check Lead scoring function in backend/server.cjs
results.leadScoringCheck = {
  hasCalculateLeadScore: serverCjs.includes('calculateLeadScore')
};

// Output JSON
fs.writeFileSync('/Users/newholland/1234567/.agents/challenger_m1_2/verification_results.json', JSON.stringify(results, null, 2));
console.log('Verification check completed.');
