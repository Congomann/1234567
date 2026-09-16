const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Fix Toolbar Button Imports
content = content.replace(
  "import { ChevronLeft, Maximize, Minimize, Check, Scan, Trash2, MousePointer2, Type, PenTool, Eraser, CheckSquare, XSquare, Calendar, Square, GripHorizontal, Undo, Redo, FileText, Image as ImageIcon, Circle, LayoutGrid } from 'lucide-react';",
  "import { ChevronLeft, Maximize, Minimize, Check, Scan, Trash2, MousePointer2, Type, PenTool, Hash, CheckSquare, Calendar, GripHorizontal, Undo, Redo, FileText, List } from 'lucide-react';"
);

// 2. Fix the ToolBtn strip
const oldToolbar = `<ToolBtn id="select" icon={MousePointer2} label="Select" />
        <ToolBtn id="text" icon={Type} label="Text Box" />
        <ToolBtn id="sign" icon={PenTool} label="Sign" />
        <ToolBtn id="check" icon={CheckSquare} label="Check" />
        <ToolBtn id="cross" icon={XSquare} label="Cross" />
        <ToolBtn id="date" icon={Calendar} label="Date" />
        
        <div className="flex items-center border-l border-gray-200 pl-3 ml-1 gap-1">
           <ToolBtn id="erase" icon={Eraser} label="Erase" />
           <ToolBtn id="image" icon={ImageIcon} label="Image" />
           <ToolBtn id="shapes" icon={Circle} label="Shapes" />
           <ToolBtn id="table" icon={LayoutGrid} label="Table" />
        </div>`;

const newToolbar = `<ToolBtn id="select" icon={MousePointer2} label="Select" />
        <ToolBtn id="text" icon={Type} label="Text Box" />
        <ToolBtn id="number" icon={Hash} label="Number" />
        <ToolBtn id="date" icon={Calendar} label="Date" />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolBtn id="sign" icon={PenTool} label="Signature" />
        <ToolBtn id="initials" icon={PenTool} label="Initials" />
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <ToolBtn id="check" icon={CheckSquare} label="Checkbox" />
        <ToolBtn id="dropdown" icon={List} label="Dropdown" />`;
content = content.replace(oldToolbar, newToolbar);

// 3. Fix the activeTool switch logic in handlePdfClick
const oldSwitch = `if (activeTool === 'sign') { type = 'signature'; name = 'Signature'; w = 20; h = 5; }
    if (activeTool === 'check') { type = 'checkbox'; name = 'Checkbox'; w = 2; h = 2; }
    if (activeTool === 'date') { type = 'date'; name = 'Date'; w = 12; h = 2.5; }`;

const newSwitch = `if (activeTool === 'text') { type = 'text'; name = 'Text Field'; w = 15; h = 2.5; }
    if (activeTool === 'number') { type = 'number'; name = 'Number Field'; w = 10; h = 2.5; }
    if (activeTool === 'date') { type = 'date'; name = 'Date'; w = 12; h = 2.5; }
    if (activeTool === 'sign') { type = 'signature'; name = 'Signature'; w = 20; h = 5; }
    if (activeTool === 'initials') { type = 'initials'; name = 'Initials'; w = 8; h = 4; }
    if (activeTool === 'check') { type = 'checkbox'; name = 'Checkbox'; w = 2; h = 2; }
    if (activeTool === 'dropdown') { type = 'dropdown'; name = 'Dropdown'; w = 15; h = 2.5; }`;
content = content.replace(oldSwitch, newSwitch);

// 4. Update the properties window icon to match Tool settings dynamically
// Actually PenTool is fine.

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Fixed toolbar mapping and buttons');
