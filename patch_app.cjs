const fs = require('fs');
let content = fs.readFileSync('App.tsx', 'utf8');
content = content.replace(
  `import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom";\nimport { Navigate } from "react-router-dom"';`,
  `import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';`
);
fs.writeFileSync('App.tsx', content);
console.log('Patched App.tsx');
