const fs = require('fs');
const path = './pages/crm/ContractingHub.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetButton = `                onClick={() => {
                  alert('Application submitted successfully!');
                  setActiveApplication(null);
                  setSignatureData(null);
                }}`;
                
const replacementButton = `                onClick={async () => {
                  setLoading(true);
                  try {
                    // In a real app we'd have the actual submission ID. We use a mock ID for the UI logic.
                    const subId = activeApplication.id || 'mock-sub-123';
                    const res = await fetch('/api/contracting/submissions/' + subId + '/sign-and-submit', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token')
                      },
                      body: JSON.stringify({
                        signatureData: signatureData,
                        mappedFields: {
                          "Name": user?.firstName + ' ' + user?.lastName,
                          "NPN": user?.npn || "12345678"
                        }
                      })
                    });
                    
                    const data = await res.json();
                    if(data.success) {
                      alert('Success! ' + data.message + '\\nPDF File Size: ' + data.pdfSize + ' bytes');
                    } else {
                      alert('Failed to submit application: ' + data.error);
                    }
                  } catch (e) {
                    alert('Network error submitting application.');
                  }
                  setActiveApplication(null);
                  setSignatureData(null);
                  setLoading(false);
                }}`;

content = content.replace(targetButton, replacementButton);
fs.writeFileSync(path, content);
