const fs = require('fs');
const path = './App.tsx';
let content = fs.readFileSync(path, 'utf8');

const importStr = "import { SetupAccount } from './pages/onboarding/SetupAccount';\n";
if (!content.includes('SetupAccount')) {
    content = importStr + content;
}

const routeTarget = `<Route path="/login" element={<Login />} />`;
const routeStr = `<Route path="/login" element={<Login />} />
          <Route path="/onboarding/setup" element={<SetupAccount />} />`;
if (!content.includes('/onboarding/setup')) {
    content = content.replace(routeTarget, routeStr);
}

fs.writeFileSync(path, content);
