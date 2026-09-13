const fs = require('fs');
const path = './pages/crm/ContractingHub.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add the import
content = content.replace(
  "import { useData } from '../../context/DataContext';",
  "import { useData } from '../../context/DataContext';\nimport SignatureCanvas from '../../components/crm/SignatureCanvas';"
);

// Add state and wizard logic
content = content.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [activeApplication, setActiveApplication] = useState<any>(null);\n  const [signatureData, setSignatureData] = useState<string | null>(null);"
);

// Add the wizard UI logic
const target = `      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">`;
const replacement = `      {activeApplication ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              Complete Application: {activeApplication.name}
            </h2>
            <button onClick={() => setActiveApplication(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
          <div className="p-8 space-y-8">
            <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm">
              <p className="font-semibold">Auto-Fill Active</p>
              <p>We have automatically populated your legal name, NPN, and address based on your Advisor Profile.</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Electronic Signature Required</h3>
              <p className="text-sm text-gray-500">By signing below, you agree to the terms and conditions set forth by {activeApplication.name}.</p>
              <SignatureCanvas 
                onSign={(data) => setSignatureData(data)} 
                onClear={() => setSignatureData(null)} 
              />
            </div>
            
            <div className="pt-6 border-t border-gray-200 flex justify-end">
              <button 
                disabled={!signatureData}
                onClick={() => {
                  alert('Application submitted successfully!');
                  setActiveApplication(null);
                  setSignatureData(null);
                }}
                className={\`px-6 py-3 rounded-lg text-white font-medium \${signatureData ? 'bg-primary-600 hover:bg-primary-700' : 'bg-gray-300 cursor-not-allowed'}\`}
              >
                Sign & Submit Application
              </button>
            </div>
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">`;

content = content.replace(target, replacement);

const targetButton = `<button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
                    Start <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>`;
const replacementButton = `<button onClick={() => setActiveApplication(carrier)} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition">
                    Start <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>`;

content = content.replace(targetButton, replacementButton);

// Close the wrapper
const endTarget = `        </div>
      </div>
    </div>
  );
}`;
const endReplacement = `        </div>
      </div>
      )}
    </div>
  );
}`;

content = content.replace(endTarget, endReplacement);
fs.writeFileSync(path, content);
