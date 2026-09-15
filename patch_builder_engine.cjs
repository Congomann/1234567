const fs = require('fs');

let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Ensure import for DetectionEngine exists
if (!builder.includes('DetectionEngine')) {
  builder = builder.replace(
    /import \{ (.*?) \} from 'lucide-react';/,
    "import { $1 } from 'lucide-react';\nimport { DetectionEngine } from '../../services/DetectionEngine';"
  );
}

// Replace the old handleAutoDetect with the new modular one
const newAutoDetect = `
  const handleAutoDetect = async () => {
    if (!pdfData) return;
    try {
      alert("Initializing Document Field-Detection Engine...");
      
      const detectedFields = await DetectionEngine.detectFields(pdfData);
      
      if (detectedFields.length > 0) {
        // Map generic DetectionResult to the existing UI state shape
        const mappedFields = detectedFields.map(df => ({
          id: df.id,
          name: df.label || 'Unknown Field',
          type: df.type === 'radio' ? 'checkbox' : df.type, // UI currently treats radio as checkbox visually
          mappedTo: 'none',
          x: df.x,
          y: df.y,
          width: df.width,
          height: df.height,
          pageNumber: df.pageNumber,
          needsReview: df.needsReview,
          confidence: df.confidence
        }));
        
        setFields([...fields, ...mappedFields]);
        
        const autoConfirmed = mappedFields.filter(f => !f.needsReview).length;
        const needsReview = mappedFields.filter(f => f.needsReview).length;
        
        alert(\`Detection Complete!\\n\\n\${autoConfirmed} High-Confidence Fields Auto-Confirmed.\\n\${needsReview} Suggested Fields (Needs Review).\`);
      } else {
        alert("The detection engine found no viable input fields on this document.");
      }
    } catch (e) {
      console.error(e);
      alert("Error during document detection.");
    }
  };
`;

// Remove the old implementation
builder = builder.replace(
  /const handleAutoDetect = async \(\) => \{[\s\S]*?alert\("Error auto-detecting fields\."\);\n    \}\n  \};/,
  newAutoDetect
);

// Update field visual rendering to highlight needsReview (orange) vs confirmed (blue)
builder = builder.replace(
  /className="absolute border-2 border-blue-400 bg-blue-400\/20 hover:bg-blue-400\/40 hover:border-blue-500 transition-colors rounded-sm cursor-pointer"/,
  `className={\`absolute border-2 \${field.needsReview ? 'border-orange-400 bg-orange-400/20 hover:bg-orange-400/40 hover:border-orange-500 border-dashed' : 'border-blue-400 bg-blue-400/20 hover:bg-blue-400/40 hover:border-blue-500'} transition-colors rounded-sm cursor-pointer\`}`
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Patched CarrierFormBuilder.tsx to use DetectionEngine');
