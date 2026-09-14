const fs = require('fs');
const filePath = 'pages/website/Partnership.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The file has a hardcoded array of carriers in the `sandboxEndpoint === 'contracting'` block.
// Let's replace the whole payload with something that doesn't use dummy carriers.
content = content.replace(
  /setApiResponse\(\{[\s\S]*?carrier: "Mutual of Omaha"[\s\S]*?\}\);/,
  `setApiResponse({
          status: "success",
          timestamp: new Date().toISOString(),
          data: {
            availableCarriers: [
              { carrier: "Internal Sandbox Life", product: "Term 20", monthlyPremium: "$48.50", underwritingTier: "Preferred Best", instantDecisionEligible: true }
            ]
          }
        });`
);

fs.writeFileSync(filePath, content);
console.log('Patched Partnership.tsx');
