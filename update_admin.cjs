const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

content = content.replace(
  /await Backend\.addCarrier\(newCarrier\.name, 'Contracting'\);/,
  `await Backend.addCarrier(newCarrier.name, 'Contracting', uploadedFile?.name);`
);

const displayTarget = `<p className="text-sm text-gray-500">Code: {carrier.code}</p>
                    </div>
                  </div>`;
const displayReplacement = `<p className="text-sm text-gray-500">Code: {carrier.code}</p>
                      {carrier.paperworkFileName && (
                        <p className="text-xs text-green-600 font-medium mt-1 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {carrier.paperworkFileName} (Uploaded)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <button className="font-medium text-blue-600 hover:text-blue-500 text-sm">
                      Map Form Fields
                    </button>
                  </div>`;
content = content.replace(displayTarget, displayReplacement);

fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log('Updated ContractingAdmin.tsx');
