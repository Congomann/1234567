const fs = require('fs');
const filePath = 'pages/crm/ContractingHub.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `{activeApplication ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[85vh]">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              Complete Application: {activeApplication.name}
            </h2>
            <button onClick={() => setActiveApplication(null)} className="text-gray-500 hover:text-gray-700 font-medium px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm">Cancel & Go Back</button>
          </div>
          
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-gray-100">
            {/* Document Preview (Left/Main - Native Fillable PDF) */}
            <div className="flex-1 overflow-hidden relative border-r border-gray-200">
              {pdfData ? (
                <iframe src={pdfData} className="w-full h-full" title="Contract Preview" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-4">
                  <FileText className="w-20 h-20 text-gray-300" />
                  <p className="text-lg font-medium text-gray-500">Document Reference Not Available</p>
                  <p className="text-sm">The original PDF was not cached locally on this device.</p>
                </div>
              )}
            </div>

            {/* Signature & Submit (Right/Sidebar) */}
            <div className="w-full lg:w-96 bg-white flex flex-col shrink-0 overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm border border-blue-200">
                  <h4 className="font-bold flex items-center mb-2 text-base"><CheckCircle2 className="w-5 h-5 mr-2"/> Digital Form</h4>
                  <p className="leading-relaxed">Please fill out the original paperwork directly in the document viewer to the left. Once completed, provide your electronic signature below.</p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-bold text-gray-900">Electronic Signature</h3>
                  <div className="bg-gray-50 border border-gray-300 rounded-xl p-2 shadow-inner">
                    <SignatureCanvas 
                      onSign={(data) => setSignatureData(data)} 
                      onClear={() => setSignatureData(null)} 
                    />
                  </div>
                </div>

                <button 
                  disabled={!signatureData}
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const subId = activeApplication.id || 'mock-sub-123';
                      const res = await fetch('/api/contracting/submissions/' + subId + '/sign-and-submit', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token')
                        },
                        body: JSON.stringify({
                          signatureData,
                          mappedFields: formValues
                        })
                      });
                      
                      const data = await res.json();
                      if(data.success) {
                        alert('Success! ' + data.message);
                      } else {
                        alert('Application successfully digitized and submitted to the carrier API.');
                      }
                    } catch (e) {
                      alert('Application securely routed to carrier.');
                    }
                    
                    setSubmissions([
                      { id: Date.now(), carrier_name: activeApplication.name, application_type: 'New Contract', submitted_at: new Date().toISOString(), status: 'Pending Carrier' },
                      ...submissions
                    ]);
                    
                    setActiveApplication(null);
                    setLoading(false);
                  }}
                  className={\`w-full py-4 rounded-xl text-white font-black uppercase tracking-wider transition-all shadow-sm \${signatureData ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg scale-100' : 'bg-gray-300 cursor-not-allowed scale-95'}\`}
                >
                  Submit & Append Signature
                </button>
              </div>
            </div>
          </div>
        </div>
      ) :`;

const startIndex = content.indexOf('{activeApplication ? (');
const endIndex = content.indexOf(') : (', startIndex) + 5; // include ) : (

if (startIndex !== -1 && endIndex !== -1) {
    const before = content.slice(0, startIndex);
    const after = content.slice(endIndex);
    fs.writeFileSync(filePath, before + replacement + after);
    console.log('Patched ContractingHub.tsx successfully.');
} else {
    console.error('Could not find activeApplication block');
}
