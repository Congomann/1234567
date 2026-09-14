const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const replacement = `
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">
                <FileText className="w-20 h-20 text-gray-300" />
                <p className="text-lg font-medium text-gray-400">Document Reference Not Available</p>
                <p className="text-sm mb-4">You can re-upload the PDF directly here to cache it.</p>
                <input 
                  type="file" 
                  accept=".pdf" 
                  className="hidden" 
                  id="direct-pdf-upload"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const reader = new FileReader();
                      reader.readAsDataURL(e.target.files[0]);
                      reader.onload = async () => {
                        await DB.save('pdf_cache', { id: carrierName, data: reader.result });
                        setPdfData(reader.result);
                      };
                    }
                  }} 
                />
                <button 
                  onClick={() => document.getElementById('direct-pdf-upload')?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium shadow hover:bg-blue-700 transition"
                >
                  Upload PDF Now
                </button>
              </div>
            )}
`;

builder = builder.replace(
  /\)\s*:\s*\(\s*<div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">[\s\S]*?<\/div>\s*\)\}/,
  replacement
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Added upload button to builder');
