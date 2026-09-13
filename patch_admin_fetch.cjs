const fs = require('fs');
const path = './pages/admin/ContractingAdmin.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `export default function ContractingAdmin() {
  const [carriers, setCarriers] = useState<any[]>([]);`;
  
const replacement = `import { useEffect } from 'react';

export default function ContractingAdmin() {
  const [carriers, setCarriers] = useState<any[]>([]);

  useEffect(() => {
    Backend.getActiveCarriers().then(res => setCarriers(res || [])).catch(console.error);
  }, []);`;

content = content.replace(target, replacement);

// Also need to fix the handleSaveCarrier to refetch
const saveTarget = `      await Backend.addCarrier(newCarrier.name, 'Contracting');
      setShowWizard(false);
      setWizardStep(1);
      // Ideally we would re-fetch carriers here
    } catch (err) {`;
const saveReplacement = `      await Backend.addCarrier(newCarrier.name, 'Contracting');
      setShowWizard(false);
      setWizardStep(1);
      const updated = await Backend.getActiveCarriers();
      setCarriers(updated || []);
    } catch (err) {`;

content = content.replace(saveTarget, saveReplacement);
fs.writeFileSync(path, content);
