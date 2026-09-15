const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Add drawMode state
builder = builder.replace(
  /const \[isFullscreen, setIsFullscreen\] = useState\(false\);/,
  `const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrawMode, setIsDrawMode] = useState(false);`
);

// 2. Wrap handlePdfClick with drawMode check
builder = builder.replace(
  /const handlePdfClick = \(e: React\.MouseEvent<HTMLDivElement>, pageIndex: number\) => \{/,
  `const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    if (!isDrawMode) return;`
);

// 3. Enhance Auto-Detect to find underscores if no widgets
const enhancedAutoDetect = `
  const handleAutoDetect = async () => {
    if (!pdfData) return;
    try {
      const loadingTask = pdfjs.getDocument(pdfData);
      const pdf = await loadingTask.promise;
      const detectedFields: any[] = [];
      let widgetCount = 0;
      let underscoreCount = 0;
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        
        // 1. Try to find native AcroForm Widgets
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
              name: anno.fieldName || 'Detected Box',
              type: anno.fieldType === 'Btn' ? 'checkbox' : 'text',
              mappedTo: 'none',
              x: x, y: y, width: w, height: h, pageNumber: i
            });
            widgetCount++;
          }
        });

        // 2. Fallback: Scan text layer for underscores (flattened PDFs)
        if (widgetCount === 0) {
          const textContent = await page.getTextContent();
          textContent.items.forEach((item: any) => {
            if (item.str && item.str.includes('____')) {
              // item.transform is [scaleX, skewY, skewX, scaleY, tx, ty]
              // tx, ty are bottom-left coordinates in PDF points
              const tx = item.transform[4];
              const ty = item.transform[5];
              const widthPt = item.width;
              const heightPt = item.height || 12; // default if 0
              
              const x = (tx / viewport.width) * 100;
              const y = (1 - ((ty + heightPt) / viewport.height)) * 100; // top-left
              const w = (widthPt / viewport.width) * 100;
              const h = (heightPt / viewport.height) * 100;
              
              // Only add if it looks like a reasonable field line
              if (w > 2) {
                detectedFields.push({
                  id: 'field_' + Date.now() + Math.random().toString(36).substr(2, 9),
                  name: 'Underscore Line',
                  type: 'text',
                  mappedTo: 'none',
                  x: x, y: y, width: w, height: Math.max(h, 2.5), pageNumber: i
                });
                underscoreCount++;
              }
            }
          });
        }
      }
      
      if (detectedFields.length > 0) {
        setFields([...fields, ...detectedFields]);
        alert(\`Success! Auto-detected \${widgetCount} native fields and \${underscoreCount} flattened lines from the PDF.\`);
      } else {
        alert("No built-in fields or fillable lines detected. You will need to enable Manual Placement mode to point-and-click fields.");
      }
    } catch (e) {
      console.error(e);
      alert("Error auto-detecting fields.");
    }
  };
`;

builder = builder.replace(
  /const handleAutoDetect = async \(\) => \{[\s\S]*?alert\("Error auto-detecting fields\."\);\n    \}\n  \};/,
  enhancedAutoDetect
);

// 4. Update the cursor style to depend on drawMode
builder = builder.replace(
  /style=\{\{ cursor: 'crosshair' \}\}/g,
  `style={{ cursor: isDrawMode ? 'crosshair' : 'default' }}`
);

// 5. Add a Draw Mode toggle in the header next to Auto-Detect
builder = builder.replace(
  /<button onClick=\{handleAutoDetect\} className="px-4 py-2 bg-indigo-100/,
  `<button 
          onClick={() => setIsDrawMode(!isDrawMode)} 
          className={\`px-4 py-2 \${isDrawMode ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} border rounded-md flex items-center font-medium shadow-sm transition mr-3\`}
        >
          <MousePointer2 className="w-4 h-4 mr-2" /> {isDrawMode ? 'Disable Manual Placement' : 'Enable Manual Placement'}
        </button>
        <button onClick={handleAutoDetect} className="px-4 py-2 bg-indigo-100`
);

// Update instructions
builder = builder.replace(
  /<p className="mt-2 text-sm text-gray-600">Point and click anywhere on the document to drop a precision field\.<\/p>/,
  '<p className="mt-2 text-sm text-gray-600">Click Auto-Detect to scan the document for fields automatically.</p>'
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Patched with Draw Mode toggle and Enhanced Auto-Detect');
