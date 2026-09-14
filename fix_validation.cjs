const fs = require('fs');
let content = fs.readFileSync('pages/admin/ContractingAdmin.tsx', 'utf8');

const handleNextTarget = `const handleNext = () => setWizardStep(prev => prev + 1);`;
const handleNextReplacement = `const handleNext = () => {
    if (wizardStep === 1 && !newCarrier.name.trim()) {
      alert("Please enter a Carrier Name before proceeding.");
      return;
    }
    if (wizardStep === 2 && !uploadedFile) {
      alert("Please upload the carrier paperwork before proceeding.");
      return;
    }
    setWizardStep(prev => prev + 1);
  };`;
content = content.replace(handleNextTarget, handleNextReplacement);

const saveTarget = `await Backend.addCarrier(newCarrier.name, 'Contracting', uploadedFile?.name);`;
const saveReplacement = `if (!newCarrier.name.trim()) return;
      await Backend.addCarrier(newCarrier.name, 'Contracting', uploadedFile?.name);
      setNewCarrier({ name: '', code: '', description: '' });`; // reset state!
content = content.replace(saveTarget, saveReplacement);

fs.writeFileSync('pages/admin/ContractingAdmin.tsx', content);
console.log('Fixed Validation');
