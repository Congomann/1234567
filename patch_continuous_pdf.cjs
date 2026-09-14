const fs = require('fs');

// Patch Admin Builder
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Replace pagination controls with a total page count
builder = builder.replace(
  /<div className="flex space-x-2">[\s\S]*?<\/div>/,
  '<div className="flex space-x-2"><span className="text-xs font-bold bg-gray-200 px-2 py-1 rounded">{numPages || 1} Pages Total</span></div>'
);

// Replace the single page render with a loop
builder = builder.replace(
  /<Page pageNumber=\{pageNumber\} renderTextLayer=\{false\} renderAnnotationLayer=\{false\} width=\{800\} \/>/,
  `{Array.from(new Array(numPages || 1), (el, index) => (
                    <div key={\`page_\${index + 1}\`} className="relative mb-4 shadow-md bg-white border border-gray-200">
                      <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
                      
                      {/* Overlay Fields for this specific page */}
                      {fields.filter(f => f.pageNumber === (index + 1)).map(field => (
                        <div 
                          key={field.id}
                          className="absolute border-2 border-blue-500 bg-blue-100/40 flex items-center justify-center group"
                          style={{
                            left: \`\${field.x}%\`,
                            top: \`\${field.y}%\`,
                            width: \`\${field.width}%\`,
                            height: \`\${field.height}%\`,
                          }}
                        >
                          <span className="text-[10px] font-bold text-blue-700 bg-white/80 px-1 truncate absolute -top-4 left-0 border border-blue-500 rounded-t">{field.name}</span>
                        </div>
                      ))}
                      
                      {/* Click Catcher for this page */}
                      <div className="absolute inset-0 z-10" onClick={(e) => handlePdfClick(e, index + 1)}></div>
                    </div>
                  ))}`
);

// We need to update handlePdfClick to take pageIndex
builder = builder.replace(
  /const handlePdfClick = \(e: React.MouseEvent<HTMLDivElement>\) => \{/,
  'const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {'
);
builder = builder.replace(
  /pageNumber: pageNumber/,
  'pageNumber: pageIndex'
);

// Remove the old overlay fields and click catcher that were sitting OUTSIDE the Page loop
builder = builder.replace(/{\/\* Overlay Fields \*\/}[\s\S]*?{\/\* Click Catcher \*\/}[\s\S]*?<\/div>/, '');

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);

// Patch Contracting Hub
let hub = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

// Replace pagination controls
hub = hub.replace(
  /<div className="mb-4 flex space-x-4 shrink-0 bg-white p-2 rounded-full shadow-lg">[\s\S]*?<\/div>/,
  '<div className="mb-4 flex space-x-4 shrink-0 bg-white p-2 rounded-full shadow-lg"><span className="font-bold text-sm px-4 py-1">{numPages || 1} Pages Total - Scroll to view all</span></div>'
);

// Replace single page with loop
hub = hub.replace(
  /<Page pageNumber=\{pageNumber\} renderTextLayer=\{false\} renderAnnotationLayer=\{false\} width=\{800\} \/>/,
  `{Array.from(new Array(numPages || 1), (el, index) => (
                    <div key={\`page_\${index + 1}\`} className="relative mb-6 shadow-md bg-white border border-gray-200">
                      <Page pageNumber={index + 1} renderTextLayer={false} renderAnnotationLayer={false} width={800} />
                      
                      {/* Render overlay inputs for this page */}
                      {fields.filter(f => f.pageNumber === (index + 1)).map(field => (
                        <div 
                          key={field.id}
                          className="absolute group"
                          style={{
                            left: \`\${field.x}%\`,
                            top: \`\${field.y}%\`,
                            width: \`\${field.width}%\`,
                            height: \`\${field.height}%\`,
                          }}
                        >
                          <input
                            type="text"
                            placeholder={field.name}
                            value={formValues[field.id] || ''}
                            onChange={(e) => handleFieldChange(field.id, e.target.value)}
                            className="w-full h-full bg-blue-50/70 border-b-2 border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm font-medium text-gray-900 px-1 absolute inset-0 z-20 outline-none transition-colors"
                          />
                        </div>
                      ))}
                    </div>
                  ))}`
);

// Remove old overlay inputs from Hub
hub = hub.replace(/{\/\* Render overlay inputs \*\/}[\s\S]*?<\/div>\s*\}\)\)/, '');

fs.writeFileSync('pages/crm/ContractingHub.tsx', hub);

console.log('Patched for continuous scrolling');
