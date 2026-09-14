const fs = require('fs');
const file = 'pages/admin/ContractingAdmin.tsx';
let content = fs.readFileSync(file, 'utf8');

const importTarget = "import React, { useState } from 'react';";
const importReplacement = "import React, { useState, useRef } from 'react';";
content = content.replace(importTarget, importReplacement);

const stateTarget = "const [newCarrier, setNewCarrier] = useState({ name: '', code: '', description: '' });";
const stateReplacement = "const [newCarrier, setNewCarrier] = useState({ name: '', code: '', description: '' });\n  const [uploadedFile, setUploadedFile] = useState<File | null>(null);\n  const fileInputRef = useRef<HTMLInputElement>(null);";
content = content.replace(stateTarget, stateReplacement);

const step2Target = `<div className="mt-4">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Select PDF Files
                    </button>
                  </div>`;
const step2Replacement = `<div className="mt-4">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      className="hidden" 
                      ref={fileInputRef} 
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setUploadedFile(e.target.files[0]);
                        }
                      }} 
                    />
                    {!uploadedFile ? (
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Select PDF Files
                      </button>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-md text-sm font-medium border border-blue-200">
                          {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </div>
                        <button 
                          onClick={() => setUploadedFile(null)}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Remove File
                        </button>
                      </div>
                    )}
                  </div>`;
content = content.replace(step2Target, step2Replacement);

const saveTarget = `setWizardStep(1);`;
const saveReplacement = `setWizardStep(1);\n      setUploadedFile(null);`;
content = content.replace(saveTarget, saveReplacement);

fs.writeFileSync(file, content);
console.log("Fixed ContractingAdmin file upload");
