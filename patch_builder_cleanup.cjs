const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// The main issue is the underscore detection logic is generating way too many false positives and messy boxes.
// Let's remove the fallback underscore detection entirely and simplify to ONLY detect native AcroForm widgets,
// or if the PDF has none, rely on manual placement (which we'll make a bit more precise).

const cleanedAutoDetect = `
  const handleAutoDetect = async () => {
    if (!pdfData) return;
    try {
      const loadingTask = pdfjs.getDocument(pdfData);
      const pdf = await loadingTask.promise;
      const detectedFields: any[] = [];
      let widgetCount = 0;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        
        // Only map native AcroForm fields that the carrier precisely placed
        const annotations = await page.getAnnotations();
        annotations.forEach((anno: any) => {
          if (anno.subtype === 'Widget') {
            const rect = anno.rect;
            const x = (rect[0] / viewport.width) * 100;
            const y = (1 - (rect[3] / viewport.height)) * 100;
            const w = ((rect[2] - rect[0]) / viewport.width) * 100;
            const h = ((rect[3] - rect[1]) / viewport.height) * 100;
            
            detectedFields.push({
              id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
              name: anno.fieldName || 'Form Field',
              type: anno.fieldType === 'Btn' ? 'checkbox' : 'text',
              mappedTo: 'none',
              x: x, y: y, width: w, height: h, pageNumber: i
            });
            widgetCount++;
          }
        });
      }
      
      if (detectedFields.length > 0) {
        setFields([...fields, ...detectedFields]);
        alert(\`Success! Auto-detected \${widgetCount} native fields from the PDF.\`);
      } else {
        alert("This PDF is flattened and contains no native form fields. Please enable Manual Placement to draw your own fields.");
      }
    } catch (e) {
      console.error(e);
      alert("Error auto-detecting fields.");
    }
  };
`;

builder = builder.replace(
  /const handleAutoDetect = async \(\) => \{[\s\S]*?alert\("Error auto-detecting fields\."\);\n    \}\n  \};/,
  cleanedAutoDetect
);

// We also need to fix how the fields are visually displayed on the PDF canvas so it looks clean and professional,
// not messy and cluttered with text. Let's make the boxes look like sleek semi-transparent highlights
// without the ugly white label overlapping everything.

builder = builder.replace(
  /<span className="text-\[10px\] font-bold text-blue-700 bg-white\/80 px-1 truncate absolute -top-4 left-0 border border-blue-500 rounded-t">\{field.name\}<\/span>/,
  `{/* Label removed for a cleaner visual look, the user manages names in the sidebar */}`
);

builder = builder.replace(
  /className="absolute border-2 border-blue-500 bg-blue-100\/40 flex items-center justify-center group"/,
  `className="absolute border-2 border-blue-400 bg-blue-400/20 hover:bg-blue-400/40 hover:border-blue-500 transition-colors rounded-sm cursor-pointer"`
);

// Add a clear all button to easily wipe the messy fields currently on the screen
builder = builder.replace(
  /<div className="flex justify-between items-center mb-4">/,
  `<div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setFields(fields.filter(f => f.pageNumber !== index + 1))} 
              className="text-xs text-red-500 hover:text-red-700"
            >
              Clear Page {index + 1}
            </button>`
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Cleaned up Auto-Detect and Field Styling');
