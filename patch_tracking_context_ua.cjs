const fs = require('fs');
const path = './context/TrackingContext.tsx';
let content = fs.readFileSync(path, 'utf8');

// Add properties to TrackingSession interface
const interfaceTarget = "deviceId: string;";
const interfaceStr = `deviceId: string;
  userAgent?: string;
  deviceType?: string;
  browser?: string;
  os?: string;`;
if(!content.includes('userAgent?: string;')) {
    content = content.replace(interfaceTarget, interfaceStr);
}

// Add the parsing logic
const initTarget = "deviceId = uuidv4();\n      localStorage.setItem('nhfg_device_id', deviceId);\n    }\n    deviceIdRef.current = deviceId;";

const initStr = `deviceId = uuidv4();
      localStorage.setItem('nhfg_device_id', deviceId);
    }
    deviceIdRef.current = deviceId;
    
    // Parse User Agent
    const ua = navigator.userAgent;
    let deviceType = 'Desktop';
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      deviceType = 'Mobile';
    } else if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      deviceType = 'Tablet';
    }
    
    let os = 'Unknown OS';
    if (ua.indexOf("Win") !== -1) os = "Windows";
    if (ua.indexOf("Mac") !== -1) os = "macOS";
    if (ua.indexOf("Linux") !== -1) os = "Linux";
    if (ua.indexOf("Android") !== -1) os = "Android";
    if (ua.indexOf("like Mac") !== -1) os = "iOS";
    
    let browser = 'Unknown Browser';
    if (ua.indexOf("Chrome") !== -1) browser = "Chrome";
    else if (ua.indexOf("Safari") !== -1) browser = "Safari";
    else if (ua.indexOf("Firefox") !== -1) browser = "Firefox";
    else if (ua.indexOf("Edge") !== -1) browser = "Edge";
    else if (ua.indexOf("MSIE") !== -1 || ua.indexOf("Trident/") !== -1) browser = "IE";`;

if(!content.includes('Parse User Agent')) {
    content = content.replace(initTarget, initStr);
}

const objTarget = `      id: uuidv4(),
      deviceId,
      startTime: new Date().toISOString(),
      pagesVisited: []`;
      
const objStr = `      id: uuidv4(),
      deviceId,
      userAgent: ua,
      deviceType,
      browser,
      os,
      startTime: new Date().toISOString(),
      pagesVisited: []`;

if(!content.includes('userAgent: ua')) {
    content = content.replace(objTarget, objStr);
}

fs.writeFileSync(path, content);
