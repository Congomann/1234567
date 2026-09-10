const fs = require('fs');

function patchFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');

  // Check if it already has toast
  if (!content.includes('const showToast =')) {
    // We need to add the toast state and function
    // Find the main component declaration
    const componentRegex = /export (const|function) (\w+)([: a-zA-Z<>=\(\)]+)\s*=>?\s*\{/;
    const match = content.match(componentRegex);
    
    if (match) {
      const toastState = `
  const [toast, setToast] = React.useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const toastRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
      setToast({ msg, type });
      clearTimeout(toastRef.current);
      toastRef.current = setTimeout(() => setToast(null), 4000);
  };
`;
      content = content.slice(0, match.index + match[0].length) + toastState + content.slice(match.index + match[0].length);
      
      // Also add the Toast JSX at the beginning of the return statement
      const returnRegex = /return\s*\(\s*(<div[^>]*>)/;
      const returnMatch = content.match(returnRegex);
      if (returnMatch) {
        const toastJSX = `
            {toast && (
              <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: toast.type === 'success' ? '#ecfdf5' : '#fff1f2', border: \`1px solid \${toast.type === 'success' ? '#a7f3d0' : '#fecdd3'}\`, color: toast.type === 'success' ? '#065f46' : '#9f1239', padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
                  {toast.msg}
              </div>
            )}
`;
        content = content.slice(0, returnMatch.index + returnMatch[0].length) + toastJSX + content.slice(returnMatch.index + returnMatch[0].length);
      }
    }
  }

  // Replace alert(...) with showToast(...)
  content = content.replace(/alert\((['"`].*?['"`])\)/g, "showToast($1)");
  
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Patched ${filepath}`);
}

patchFile('pages/crm/AdvisorResources.tsx');
patchFile('pages/crm/ProfileSettings.tsx');
patchFile('pages/crm/VideoConferencing.tsx');
patchFile('pages/crm/TelephonyHub.tsx');

