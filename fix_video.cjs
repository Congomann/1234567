const fs = require('fs');

let content = fs.readFileSync('pages/crm/VideoConferencing.tsx', 'utf8');
if (!content.includes('useData')) {
    content = content.replace("import { SEO } from '../../components/SEO';", "import { SEO } from '../../components/SEO';\nimport { useData } from '../../context/DataContext';");
    content = content.replace("const [toast, setToast] = React.useState", "const { user } = useData();\n  const [toast, setToast] = React.useState");
    content = content.replace("const [advisorName, setAdvisorName] = useState('NHFG Advisor');", "const [advisorName, setAdvisorName] = useState(user?.name || 'NHFG Advisor');");
    fs.writeFileSync('pages/crm/VideoConferencing.tsx', content, 'utf8');
    console.log("Patched VideoConferencing.tsx with useData");
}
