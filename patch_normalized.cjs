const fs = require('fs');

let file = fs.readFileSync('components/crm/NormalizedPolicySection.tsx', 'utf-8');

const replacement = `
            const token = localStorage.getItem('nhfg_token') || localStorage.getItem('token');
            const response = await fetch('http://localhost:3001/api/carrier/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': \`Bearer \${token}\` },
                body: JSON.stringify({
                    carrierId,
                    scenario: targetScenario,
                    clientId: client.id,
                    clientName,
                    clientEmail,
                    policyNumber,
                    basePremium
                })
            });
            
            if (!response.ok) throw new Error('Failed to fetch from carrier API');
            const data = await response.json();
            rawPayload = data.rawPayload;
            
            // Execute universal normalization through CarrierRegistry singleton`;

// Replace from `if (carrierId === 'acme-mutual') {` to `// Execute universal normalization through CarrierRegistry singleton`
const startIndex = file.indexOf("if (carrierId === 'acme-mutual') {");
const endIndex = file.indexOf("// Execute universal normalization through CarrierRegistry singleton");

if (startIndex !== -1 && endIndex !== -1) {
    const p1 = file.substring(0, startIndex);
    const p2 = file.substring(endIndex + "// Execute universal normalization through CarrierRegistry singleton".length);
    file = p1 + replacement + p2;
    fs.writeFileSync('components/crm/NormalizedPolicySection.tsx', file, 'utf-8');
    console.log('Successfully patched NormalizedPolicySection.tsx');
} else {
    console.log('Could not find the target string');
}
