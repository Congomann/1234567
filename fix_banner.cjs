const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierIntegrations.tsx', 'utf8');

const oldBanner = `<Tab3DBanner 
        Icon={Plug} 
        title="Carrier API Connections"
        subtitle="Manage API keys and OAuth tokens for automated policy activity tracking (e.g. DTCC, NIPR, direct carrier endpoints)."
        color="indigo"
      />`;
      
const newBanner = `<div className="bg-indigo-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Plug className="w-48 h-48" />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-3">Carrier API Connections</h1>
          <p className="text-indigo-200 max-w-2xl text-lg">
            Manage API keys and OAuth tokens for automated policy activity tracking (e.g. DTCC, NIPR, direct carrier endpoints).
          </p>
        </div>
      </div>`;

content = content.replace(oldBanner, newBanner);
fs.writeFileSync('pages/admin/CarrierIntegrations.tsx', content);
