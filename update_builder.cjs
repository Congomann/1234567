const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Slow down the resize speed
const oldDelta = `const deltaXPct = ((e.clientX - actionState.startMouseX) / parentRect.width) * 100;
      const deltaYPct = ((e.clientY - actionState.startMouseY) / parentRect.height) * 100;`;
const newDelta = `const deltaXPct = (((e.clientX - actionState.startMouseX) / parentRect.width) * 100) * 0.4; // Slower, steady crop
      const deltaYPct = (((e.clientY - actionState.startMouseY) / parentRect.height) * 100) * 0.4;`;
content = content.replace(oldDelta, newDelta);

// 2. Delete the Floating Properties Panel completely
// We will use substring replacement because regular expressions across many lines can be tricky.
const panelStart = "{/* Floating Properties Panel (Replaces Sidebar) */}";
const panelEnd = "        )}";
const startIdx = content.indexOf(panelStart);
if (startIdx !== -1) {
    // find the matching closing bracket for the selectedFieldId && ( ... )
    // Actually, looking at the file it ends right before `      </div>\n    </div>\n  );\n}`
    const endStr = "      </div>\n    </div>\n  );\n}";
    const endIdx = content.indexOf(endStr);
    if (endIdx !== -1) {
       content = content.substring(0, startIdx) + endStr;
    }
}

// 3. Add keyboard delete listener
const oldEffect = `  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('pdf-container-wrapper');
      if (container) {
        setPdfWidth(container.clientWidth - 40);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);`;

const newEffect = `  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('pdf-container-wrapper');
      if (container) {
        setPdfWidth(container.clientWidth - 40);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedFieldId && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          removeField(selectedFieldId);
          setSelectedFieldId(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFieldId, removeField]);`;

content = content.replace(oldEffect, newEffect);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log("Applied panel removal, resize dampening, and delete keyboard shortcut.");
