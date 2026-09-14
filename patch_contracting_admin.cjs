const fs = require('fs');
const filePath = 'pages/admin/ContractingAdmin.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Ensure Trash2 is imported
if (!content.includes('Trash2')) {
  content = content.replace('Plus, FileUp, CheckCircle', 'Plus, FileUp, CheckCircle, Trash2');
}

// Add delete handler inside the component
if (!content.includes('handleDeleteCarrier')) {
  const insertIndex = content.indexOf('const handleSaveCarrier = async () => {');
  const deleteFunction = `
  const handleDeleteCarrier = async (name: string) => {
    if (!confirm('Are you sure you want to delete ' + name + '? This cannot be undone.')) return;
    try {
      await Backend.deleteCarrier(name);
      const updated = await Backend.getActiveCarriers();
      setCarriers(updated || []);
    } catch (e) {
      console.error(e);
      alert('Failed to delete carrier.');
    }
  };

  `;
  content = content.slice(0, insertIndex) + deleteFunction + content.slice(insertIndex);
}

// Add the delete button to the UI
const findLink = `<Link to="/crm/admin/contracting/builder" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                      Map Form Fields
                    </Link>`;
const replaceWith = `<div className="flex items-center space-x-4">
                      <Link to="/crm/admin/contracting/builder" className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                        Map Form Fields
                      </Link>
                      <button onClick={() => handleDeleteCarrier(carrier.name)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete Carrier">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>`;

content = content.replace(findLink, replaceWith);

fs.writeFileSync(filePath, content);
console.log('Patched ContractingAdmin.tsx');
