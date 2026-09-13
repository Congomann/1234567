const fs = require('fs');
const path = './pages/admin/ContractingReviewQueue.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `export default function ContractingReviewQueue() {
  const [queueItems, setQueueItems] = useState<any[]>([]);`;
  
const replacement = `import { useEffect } from 'react';

export default function ContractingReviewQueue() {
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/contracting/queue', {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('nhfg_access_token') }
    })
    .then(res => res.json())
    .then(data => {
      setQueueItems(Array.isArray(data) ? data : []);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading queue...</div>;`;

content = content.replace(target, replacement);

const itemTarget = `<div className="text-sm text-gray-500">Confidence: {item.confidence}%</div>`;
const itemReplacement = `<div className="text-sm flex items-center space-x-4">
                    <span className="text-gray-500">From: {item.from_email}</span>
                    <span className={\`font-bold \${item.ai_confidence >= 90 ? 'text-green-600' : 'text-orange-500'}\`}>Confidence: {item.ai_confidence}%</span>
                  </div>`;
content = content.replace(itemTarget, itemReplacement);

fs.writeFileSync(path, content);
