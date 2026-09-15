const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Remove Configured Fields header completely, replace with Form Tools and an Add Field button
const oldSidebarHeader = `<div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-gray-900">Configured Fields</h3>
            <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded-full">{fields.length} Total</span>
          </div>`;

const newSidebarHeader = `<div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-gray-900">Field Configuration</h3>
            <button 
              onClick={() => {
                const newField = {
                  id: 'field_' + Date.now(),
                  name: 'New Custom Field',
                  type: 'text',
                  mappedTo: 'none',
                  x: 30,
                  y: 10,
                  width: 25,
                  height: 3,
                  pageNumber: pageNumber || 1
                };
                setFields([...fields, newField]);
                setSelectedFieldId(newField.id);
              }}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded shadow-sm hover:bg-blue-700 transition"
            >
              + Add Missing Field
            </button>
          </div>`;

content = content.replace(oldSidebarHeader, newSidebarHeader);

// 2. Change the empty state text
const oldEmptyState = `<p className="mt-2 text-sm text-gray-600">Click Auto-Detect to scan the document for fields automatically.</p>`;
const newEmptyState = `<p className="mt-2 text-sm text-gray-600">Click Auto-Detect to scan, or click "+ Add Missing Field" to manually add fields the PDF missed.</p>`;
content = content.replace(oldEmptyState, newEmptyState);

// 3. Just to be safe, remove the "Configured Fields" text if it exists anywhere else exactly
content = content.replace(/>Configured Fields</g, '>Field Configuration<');

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Patched Form Builder UI');
