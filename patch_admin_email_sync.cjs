const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

// Ensure Mail icon is imported
if (!content.includes('Mail')) {
  content = content.replace(
    "import { Plus, Upload, Trash2, FileText, CheckCircle, ArrowRight } from 'lucide-react';",
    "import { Plus, Upload, Trash2, FileText, CheckCircle, ArrowRight, Mail, RefreshCw } from 'lucide-react';"
  );
}

// Add state for email sync
if (!content.includes('const [isSyncing, setIsSyncing] =')) {
  content = content.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [isSyncing, setIsSyncing] = useState(false);\n  const [syncStatus, setSyncStatus] = useState(\'\');'
  );
}

// Add handleEmailSync function
const handleEmailSyncFn = `
  const handleEmailSync = async () => {
    setIsSyncing(true);
    setSyncStatus('Connecting to Inbox...');
    try {
      const res = await fetch('/api/contracting/email-sync', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token')
        }
      });
      const data = await res.json();
      if (data.success) {
        setSyncStatus(\`Success! Scanned \${data.totalScanned} emails. Found \${data.processed} contracting links.\`);
        if (data.processed > 0) {
          loadPackages();
        }
      } else {
        setSyncStatus('Sync Failed: ' + data.error);
      }
    } catch (e) {
      setSyncStatus('Connection error.');
    }
    setIsSyncing(false);
  };
`;

if (!content.includes('const handleEmailSync')) {
  content = content.replace('useEffect(() => {', handleEmailSyncFn + '\n\n  useEffect(() => {');
}

// Add the UI block
const uiBlock = `
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-blue-600" /> 
              Carrier Email Automation
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Automatically scan sales@newhollandfinancial.com for contracting & onboarding links from carriers.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <button 
              onClick={handleEmailSync}
              disabled={isSyncing}
              className={\`flex items-center px-4 py-2 rounded-md font-medium shadow-sm transition-colors \${isSyncing ? 'bg-blue-300 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}\`}
            >
              <RefreshCw className={\`w-4 h-4 mr-2 \${isSyncing ? 'animate-spin' : ''}\`} />
              {isSyncing ? 'Syncing Inbox...' : 'Sync Inbox Now'}
            </button>
            {syncStatus && <span className="text-xs text-blue-800 font-medium mt-2">{syncStatus}</span>}
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
`;

content = content.replace('<div className="bg-white shadow overflow-hidden sm:rounded-md">', uiBlock);

fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log('Patched ContractingAdmin with Email Sync UI.');
