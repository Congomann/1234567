const fs = require('fs');
let builder = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// Replace pointer drawing logic with a simple precision click
const newClickLogic = `
  const handlePdfClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Docusign style: Drop a field exactly where clicked
    const newField = {
      id: 'field_' + Date.now(),
      name: 'New Field',
      type: 'text',
      mappedTo: 'none',
      x: x,
      y: y,
      width: 15, // Standard optimal width
      height: 2.5, // Standard optimal height for a text line
      pageNumber: pageIndex
    };
    
    setFields([...fields, newField]);
  };
`;

builder = builder.replace(
  /const handlePointerDown = [\s\S]*?setCurrentDraw\(null\);\n  \};/,
  newClickLogic
);

// Remove drawing state variables
builder = builder.replace(/const \[isDrawing, setIsDrawing\] = useState\(false\);\n/, '');
builder = builder.replace(/const \[drawStart, setDrawStart\] = useState.*?;\n/, '');
builder = builder.replace(/const \[currentDraw, setCurrentDraw\] = useState.*?;\n/, '');

// Replace pointer event handlers with simple onClick and custom cursor
builder = builder.replace(
  /onPointerDown=\{\(e\) => handlePointerDown\(e, index \+ 1\)\}[\s\S]*?onPointerCancel=\{\(e\) => handlePointerUp\(e, index \+ 1\)\}/g,
  `onClick={(e) => handlePdfClick(e, index + 1)} style={{ cursor: 'crosshair' }}`
);

// Remove the Temporary Draw Box completely
builder = builder.replace(/\{\/\* Temporary Draw Box \*\/\}[\s\S]*?\{\/\* Pointer Catcher for this page \*\/\}/g, '{/* Click Catcher for this page */}');

// Change the instructions to match Docusign style
builder = builder.replace(
  /<p>Click and drag on the PDF to draw a precisely sized text box\.<\/p>/,
  '<p>Point and click anywhere on the document to drop a precision field.</p>'
);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', builder);
console.log('Patched CarrierFormBuilder.tsx to Docusign style');
