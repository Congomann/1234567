const fs = require('fs');
let content = fs.readFileSync('pages/admin/CarrierFormBuilder.tsx', 'utf8');

// 1. Fix the Worker Src
const oldWorker = 'pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;';
const newWorker = 'pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;';
content = content.replace(oldWorker, newWorker);

// 2. Add imports for DB and useEffect logic
content = content.replace(
  "import { DetectionEngine } from '../../services/DetectionEngine';",
  "import { DetectionEngine } from '../../services/DetectionEngine';\nimport { DB } from '../../services/database';"
);

// 3. Inject the useEffect
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
    if (carrierId) {
      DB.getAll('pdf_cache').then(caches => {
        const cached = (caches as any[]).find(c => c.id === carrierId);
        if (cached && cached.data) {
          setPdfData(cached.data);
        }
      }).catch(console.error);
    }
  }, [carrierId]);`;

content = content.replace(oldEffect, newEffect);

fs.writeFileSync('pages/admin/CarrierFormBuilder.tsx', content);
console.log('Fixed Worker URL and Restored IndexedDB cache loading');
