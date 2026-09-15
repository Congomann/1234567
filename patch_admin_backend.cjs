const fs = require('fs');

// 1. Update apiBackend.ts
let api = fs.readFileSync('services/apiBackend.ts', 'utf8');
if (!api.includes('deleteCarrierPackage')) {
    api = api.replace(
        /async getAutosavedSubmissions/,
        `async deleteCarrierPackage(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(this.baseUrl + '/contracting/packages/' + id, { method: 'DELETE', headers: this.getAuthHeaders() });
            } catch (e) {}
        }
        const pkgs = await DB.getAll('carrier_packages') || [];
        const filtered = pkgs.filter((p: any) => p.id !== id);
        // Clear all and resave to simulate delete (or just implement DB.delete if it exists)
        await DB.delete('carrier_packages', id);
    }
    
    async getAutosavedSubmissions`
    );
    fs.writeFileSync('services/apiBackend.ts', api);
}

// 2. Update ContractingAdmin.tsx
let admin = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

// Replace select with input
admin = admin.replace(
    /<select[\s\S]*?<\/select>/,
    `<input 
                    type="text" 
                    className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g. Transamerica"
                    value={carrierName}
                    onChange={e => setCarrierName(e.target.value)}
                  />`
);

// Add delete handler and view handler
admin = admin.replace(
    /const loadPackages = async \(\) => \{/,
    `const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      await Backend.deleteCarrierPackage(id);
      loadPackages();
    }
  };

  const handleView = async (pkg: any) => {
    const pdfId = \`\${pkg.carrier_name}-\${pkg.version}\`;
    const caches = await DB.getAll('pdf_cache') || [];
    const cached = caches.find(c => c.id === pdfId);
    if (cached && cached.data) {
      const win = window.open();
      if (win) {
        win.document.write(\`<iframe src="\${cached.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>\`);
      }
    } else {
      alert("PDF not found in local cache.");
    }
  };

  const loadPackages = async () => {`
);

// Update buttons
admin = admin.replace(
    /<Link[\s\S]*?Manage\n\s*<\/Link>\n\s*<button className="px-3 py-1\.5 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50">\n\s*View\n\s*<\/button>\n\s*<button className="px-3 py-1\.5 bg-white text-red-600 text-sm font-medium rounded border border-gray-300 hover:bg-red-50">\n\s*Disable\n\s*<\/button>/g,
    `<Link 
                      to={\`/crm/admin/contracting/builder?carrier=\${encodeURIComponent(pkg.carrier_name + '-' + pkg.version)}\`}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 shadow-sm transition"
                    >
                      Manage
                    </Link>
                    <button onClick={() => handleView(pkg)} className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded border border-gray-300 hover:bg-gray-50 shadow-sm transition">
                      View
                    </button>
                    <button onClick={() => handleDelete(pkg.id)} className="px-4 py-2 bg-white text-red-600 text-sm font-medium rounded border border-gray-300 hover:bg-red-50 shadow-sm transition">
                      Delete
                    </button>`
);

// Change "Disable" to "Delete" in the list as well (if any text remains)
admin = admin.replace(/>Disable</g, '>Delete<');

fs.writeFileSync('pages/admin/ContractingAdmin.tsx', admin);
console.log('Patched ContractingAdmin.tsx');
