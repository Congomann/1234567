const fs = require('fs');
const path = './context/TrackingContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace find() bug in useEffect
const useEffectBug = `
      const lastVisit = sessionRef.current.pagesVisited.find(v => v.path === lastPathRef.current);
      if (lastVisit) {
        lastVisit.timeSpent = (lastVisit.timeSpent || 0) + timeSpent;
      }
`;
const fixedLastVisit = `
      const visitsLength = sessionRef.current.pagesVisited.length;
      if (visitsLength > 0) {
        const lastVisit = sessionRef.current.pagesVisited[visitsLength - 1];
        if (lastVisit.path === lastPathRef.current) {
          lastVisit.timeSpent = (lastVisit.timeSpent || 0) + timeSpent;
        }
      }
`;
content = content.replace(useEffectBug, fixedLastVisit);

// Replace find() bug in flushSession
content = content.replace(useEffectBug, fixedLastVisit);

fs.writeFileSync(path, content);
