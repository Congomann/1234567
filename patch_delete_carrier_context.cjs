const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add to interface
const interfaceTarget = "addCarrier: (name: string, category: string) => Promise<void>;";
content = content.replace(interfaceTarget, interfaceTarget + "\n  deleteCarrier: (name: string) => Promise<void>;");

// 2. Add implementation
const implTarget = "const addCarrier = async (name: string, category: string) => {";
const implStr = `const deleteCarrier = async (name: string) => {
    try {
      await apiBackend.deleteCarrier(name);
      setAvailableCarriers(prev => prev.filter(c => c.name !== name));
    } catch (err) {
      console.error('Failed to delete carrier', err);
      throw err;
    }
  };
  
  `;
content = content.replace(implTarget, implStr + implTarget);

// 3. Add to provider export
const exportTarget = "addCarrier, ";
content = content.replace(exportTarget, exportTarget + "deleteCarrier, ");

fs.writeFileSync(path, content);
