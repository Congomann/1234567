const fs = require('fs');
const path = './pages/admin/CarrierAssignment.tsx';
let content = fs.readFileSync(path, 'utf8');

const importTarget = "Plus, X } from 'lucide-react';";
if (!content.includes('Trash2')) {
  content = content.replace(importTarget, "Plus, X, Trash2 } from 'lucide-react';");
}

const contextTarget = "const { allUsers, availableCarriers, assignCarriers, addCarrier } = useData();";
if (!content.includes('deleteCarrier')) {
  content = content.replace(contextTarget, "const { allUsers, availableCarriers, assignCarriers, addCarrier, deleteCarrier } = useData();");
}

const deleteHandlerStr = `
  const handleDeleteCarrier = async (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (confirm(\`Are you sure you want to delete \${name} from partnerships?\`)) {
      try {
        await deleteCarrier(name);
      } catch (err: any) {
        alert(err.message || 'Failed to delete carrier');
      }
    }
  };
`;
if (!content.includes('handleDeleteCarrier')) {
  const handlerTarget = "const handleBulkAssign = () => {";
  content = content.replace(handlerTarget, deleteHandlerStr + "\n  " + handlerTarget);
}

const mappingTarget = `
                                        <span className={\`text-sm font-medium \${selectedCarrierNames.has(carrier.name) ? 'text-blue-900' : 'text-slate-600'}\`}>
                                            {carrier.name}
                                        </span>
                                    </div>
`;
const mappingStr = `
                                        <span className={\`text-sm font-medium flex-1 \${selectedCarrierNames.has(carrier.name) ? 'text-blue-900' : 'text-slate-600'}\`}>
                                            {carrier.name}
                                        </span>
                                        <button onClick={(e) => handleDeleteCarrier(e, carrier.name)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
`;
content = content.replace(mappingTarget, mappingStr);

// add 'group' class to the div so group-hover works
const divTarget = "className={`flex items-start p-3 rounded-xl cursor-pointer border transition-all";
content = content.replace(divTarget, "className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all");

fs.writeFileSync(path, content);
