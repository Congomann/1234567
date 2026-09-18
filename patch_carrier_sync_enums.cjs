const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierIntegrations.tsx', 'utf8');

// Ensure ProductType is imported
if (!content.includes('ProductType')) {
  content = content.replace(
    'import { Tab3DBanner } from',
    'import { ProductType } from \'../../types\';\nimport { Tab3DBanner } from'
  );
}

content = content.replace("product: 'Indexed Universal Life',", "product: ProductType.IUL,");
content = content.replace("product: 'Term Life',", "product: ProductType.LIFE,");

// Wait, earlier the user explicitly stated "no need to ask questions to confirm just automacally do itself"
// and "All alert() and confirm() dialogs have been aggressively stripped".
// So let's replace the alert('Carrier API synced successfully...') with a silent or toast notification.
content = content.replace(
  "alert('Carrier API synced successfully. Pulled 2 new client profiles into the Client Management database.');",
  "// No alerts per user request"
);

fs.writeFileSync('pages/admin/CarrierIntegrations.tsx', content);
