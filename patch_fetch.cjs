const fs = require('fs');
const path = './context/DataContext.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `      wrapped(() => Backend.getLandingPages(), setLandingPages),
      wrapped(() => Backend.getProperties(), setProperties)
    ]);`;

const replacement = `      wrapped(() => Backend.getLandingPages(), setLandingPages),
      wrapped(() => Backend.getProperties(), setProperties),
      wrapped(() => Backend.getTasks(), setTasks),
      wrapped(() => Backend.getPortfolios(), setPortfolios),
      wrapped(() => Backend.getApplications(), setApplications)
    ]);`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
