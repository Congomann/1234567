const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const oldRequired = `<div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                      <label className="text-sm font-semibold text-gray-700">Required Field</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={field.required || false} onChange={e => updateField(field.id, { required: e.target.checked })} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>`;

const newRequiredAndSliders = `<div className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-100">
                      <label className="text-sm font-semibold text-gray-700">Required Field</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={field.required || false} onChange={e => updateField(field.id, { required: e.target.checked })} className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="pt-2 border-t border-gray-100 mt-2">
                      <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">Field Sizing</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Width</span> <span>{Math.round(field.width)}%</span></label>
                          <input type="range" min="1" max="100" step="0.1" value={field.width} onChange={e => updateField(field.id, { width: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-500 mb-1 flex justify-between"><span>Height</span> <span>{Math.round(field.height)}%</span></label>
                          <input type="range" min="1" max="100" step="0.1" value={field.height} onChange={e => updateField(field.id, { height: parseFloat(e.target.value) })} className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                    </div>`;

content = content.replace(oldRequired, newRequiredAndSliders);
fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Restored width and height sliders');
