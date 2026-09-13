const fs = require('fs');
const path = './pages/admin/CarrierAssignment.tsx';
let content = fs.readFileSync(path, 'utf8');

const importTarget = "import { Shield, CheckSquare, Square, Search, UserCheck } from 'lucide-react';";
content = content.replace(importTarget, "import { Shield, CheckSquare, Square, Search, UserCheck, Plus, X } from 'lucide-react';");

const dataContextTarget = "const { allUsers, availableCarriers, assignCarriers } = useData();";
content = content.replace(dataContextTarget, "const { allUsers, availableCarriers, assignCarriers, addCarrier } = useData();");

const stateTarget = "const [isSuccess, setIsSuccess] = useState(false);";
const stateStr = `
  const [isSuccess, setIsSuccess] = useState(false);
  const [showAddCarrier, setShowAddCarrier] = useState(false);
  const [newCarrierName, setNewCarrierName] = useState('');
  const [newCarrierCategory, setNewCarrierCategory] = useState('Life Insurance');
  
  const handleAddCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCarrierName) return;
    try {
      await addCarrier(newCarrierName, newCarrierCategory);
      setNewCarrierName('');
      setShowAddCarrier(false);
    } catch(err: any) {
      alert(err.message || 'Failed to add carrier');
    }
  };
`;
content = content.replace(stateTarget, stateStr);

const buttonTarget = `<h3 className="text-lg font-bold text-[#0B2240]">2. Select Carriers</h3>`;
const newButtonTarget = `
                    <div className="flex items-center justify-between w-full">
                        <h3 className="text-lg font-bold text-[#0B2240]">2. Select Carriers</h3>
                        <button onClick={() => setShowAddCarrier(true)} className="flex items-center gap-1 text-xs font-bold bg-[#0A62A7] text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> Add Partnership
                        </button>
                    </div>
`;
content = content.replace(buttonTarget, newButtonTarget);

const modalTarget = `    </div>\n  );\n};`;
const modalStr = `
        {showAddCarrier && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
                    <button onClick={() => setShowAddCarrier(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                        <X className="h-5 w-5" />
                    </button>
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Partnership</h2>
                    <form onSubmit={handleAddCarrier} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Carrier Name</label>
                            <input 
                                type="text" 
                                required 
                                value={newCarrierName} 
                                onChange={e => setNewCarrierName(e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500" 
                                placeholder="e.g. GEICO" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Category</label>
                            <select 
                                value={newCarrierCategory} 
                                onChange={e => setNewCarrierCategory(e.target.value)} 
                                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                            >
                                <option>Life Insurance</option>
                                <option>Health</option>
                                <option>Auto & Commercial</option>
                                <option>Annuities</option>
                            </select>
                        </div>
                        <div className="pt-2">
                            <button type="submit" className="w-full bg-[#0A62A7] text-white font-bold py-3 rounded-xl hover:bg-blue-700">
                                Save Partnership
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
`;
content = content.replace(modalTarget, modalStr + modalTarget);

fs.writeFileSync(path, content);
