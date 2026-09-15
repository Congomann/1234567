const fs = require('fs');

// 1. Add api method
let api = fs.readFileSync('services/apiBackend.ts', 'utf8');
if (!api.includes('signAndSubmitContract')) {
    api = api.replace(
        /async autosaveSubmission/,
        `async signAndSubmitContract(payload: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            await fetch(this.baseUrl + '/contracting/sign-and-submit', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(payload)
            });
        }
    }
    
    async autosaveSubmission`
    );
    fs.writeFileSync('services/apiBackend.ts', api);
}

// 2. Update ContractingHub.tsx to call it
let hub = fs.readFileSync('pages/crm/ContractingHub.tsx', 'utf8');

hub = hub.replace(
    /const submitContract = async \(\) => \{[\s\S]*?setIsSubmitting\(false\);\n    \}\n  \};/,
    `const submitContract = async () => {
    setIsSubmitting(true);
    try {
      // 1. Save final status
      await Backend.autosaveSubmission({
        id: activeApplication.submissionId,
        package_id: activeApplication.id,
        carrier_name: activeApplication.carrier_name,
        package_name: activeApplication.package_name,
        user_id: user?.id,
        status: 'Submitted',
        progress: 100,
        data: formValues,
        updated_at: new Date().toISOString()
      });
      
      // 2. Generate PDF and email to carrier
      await Backend.signAndSubmitContract({
        carrier_name: activeApplication.carrier_name,
        formValues: formValues,
        fields: fields,
        pdfData: pdfData
      });
      
      alert('Contract Generated & Submitted! The completed PDF has been automatically emailed to sales@newhollandfinancial.com and the Carrier Contracting Department.');
      setActiveApplication(null);
    } catch (e) {
      alert('Failed to generate and submit contract.');
    } finally {
      setIsSubmitting(false);
    }
  };`
);

fs.writeFileSync('pages/crm/ContractingHub.tsx', hub);
console.log('Patched ContractingHub and apiBackend');
