const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

const autoDetectLogic = `
  const handleAutoDetect = async () => {
    if (!pdfData) return;
    try {
      alert("Scanning PDF for existing form fields...");
      const loadingTask = pdfjs.getDocument(pdfData);
      const pdf = await loadingTask.promise;
      const detectedFields: any[] = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        const annotations = await page.getAnnotations();
        
        annotations.forEach((anno: any) => {
          if (anno.subtype === 'Widget') {
            const rect = anno.rect;
            // PDF coordinates: [x1, y1, x2, y2] from bottom-left
            const x = (rect[0] / viewport.width) * 100;
            const y = (1 - (rect[3] / viewport.height)) * 100;
            const w = ((rect[2] - rect[0]) / viewport.width) * 100;
            const h = ((rect[3] - rect[1]) / viewport.height) * 100;
            
            detectedFields.push({
              id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
              name: anno.fieldName || 'Detected Box',
              type: anno.fieldType === 'Btn' ? 'checkbox' : 'text',
              mappedTo: 'none',
              x: x,
              y: y,
              width: w,
              height: h,
              pageNumber: i
            });
          }
        });
      }
      
      if (detectedFields.length > 0) {
        setFields([...fields, ...detectedFields]);
        alert(\`Success! Auto-detected \${detectedFields.length} fields from the PDF.\`);
      } else {
        alert("No built-in fields detected. This PDF might be flattened. You can still point-and-click to add fields manually.");
      }
    } catch (e) {
      console.error(e);
      alert("Error auto-detecting fields.");
    }
  };
`;

// Insert the logic before handleSave
builder = builder.replace(
  /const handleSave = async \(\) => \{/,
  autoDetectLogic + '\n  const handleSave = async () => {'
);

// Add the Auto-Detect button to the header
builder = builder.replace(
  /<button onClick=\{handleSave\} className="px-4 py-2 bg-blue-600/,
  `<button onClick={handleAutoDetect} className="px-4 py-2 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-200 flex items-center font-medium shadow-sm transition mr-3">
          <Scan className="w-4 h-4 mr-2" /> Auto-Detect Fields
        </button>
        <button onClick={handleSave} className="px-4 py-2 bg-blue-600`
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Added auto-detect logic');
