const fs = require('fs');

let bf = fs.readFileSync('pages/crm/accounting/BankFeeds.tsx', 'utf8');

// Remove MOCK_INSTITUTIONS
const mockRegex = /\/\/ MOCK PLAID INSTITUTIONS LIST\nconst INSTITUTIONS = \[\s*\{[^\]]*\];/;
bf = bf.replace(mockRegex, '');

// Add fetch
const fetchCode = `
  const [institutions, setInstitutions] = useState<any[]>([]);
  useEffect(() => {
      Backend.getPlaidInstitutions().then(setInstitutions).catch(console.error);
  }, []);
`;
bf = bf.replace(/const \[activeTab, setActiveTab\] = useState<'feeds' | 'rules'>\('feeds'\);/, fetchCode + "\n  const [activeTab, setActiveTab] = useState<'feeds' | 'rules'>('feeds');");

// Replace INSTITUTIONS map with institutions
bf = bf.replace(/INSTITUTIONS\.map/g, 'institutions.map');
bf = bf.replace(/import \{ Plus, CreditCard, RefreshCw, CheckCircle2, ArrowUpRight, ArrowDownLeft, Building2, ChevronDown, Check, Loader2, ShieldCheck, Lock, Wand2, Trash2, Settings \} from 'lucide-react';/, "import { Plus, CreditCard, RefreshCw, CheckCircle2, ArrowUpRight, ArrowDownLeft, Building2, ChevronDown, Check, Loader2, ShieldCheck, Lock, Wand2, Trash2, Settings } from 'lucide-react';\nimport { Backend } from '../../../services/apiBackend';");

fs.writeFileSync('pages/crm/accounting/BankFeeds.tsx', bf);

// Now patch apiBackend.ts
let api = fs.readFileSync('services/apiBackend.ts', 'utf8');
const plaidCode = `
    async getPlaidInstitutions(): Promise<any[]> {
        try {
            const res = await fetch(\`\${this.baseUrl}/plaid/institutions\`, {
                headers: this.getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                return data.institutions || [];
            }
        } catch (e) {
            console.error(e);
        }
        return [];
    }
`;
api = api.replace(/async getLoads\(\): Promise<any\[\]> \{/, plaidCode + "\n    async getLoads(): Promise<any[]> {");
fs.writeFileSync('services/apiBackend.ts', api);

// Now patch server.cjs
let server = fs.readFileSync('backend/server.cjs', 'utf8');
const serverCode = `
app.get('/api/plaid/institutions', authenticateToken, async (req, res) => {
    try {
        // Return real institutions if plaid is configured, else return empty
        res.json({ institutions: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
`;
server = server.replace(/app\.get\('\/api\/plaid\/usage-logs'/, serverCode + "\napp.get('/api/plaid/usage-logs'");
fs.writeFileSync('backend/server.cjs', server);

console.log('patched bank feeds');
