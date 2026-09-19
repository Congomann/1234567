const fs = require('fs');
let content = fs.readFileSync('components/Footer.tsx', 'utf8');

if (!content.includes('<Link to="/disclaimer"')) {
  content = content.replace(
    '<Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Use</Link>',
    '<Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Use</Link>\n            <Link to="/disclaimer" className="hover:text-slate-300 transition-colors">Disclaimer</Link>\n            <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookie Policy</Link>'
  );
  fs.writeFileSync('components/Footer.tsx', content);
  console.log('Patched Footer.tsx');
}
