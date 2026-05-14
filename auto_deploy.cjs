const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * NHFG ROBUST AUTO-DEPLOY AGENT (V2)
 * 
 * Uses absolute paths and process environments to ensure 
 * 'node' and 'npx' are always found.
 */

const NODE_PATH = process.execPath;
const PROJECT_DIR = process.cwd();

console.log("-----------------------------------------");
console.log("🚀 NHFG Auto-Deploy Agent V2 is LIVE");
console.log(`📁 Project: ${PROJECT_DIR}`);
console.log(`🟢 Engine: ${NODE_PATH}`);
console.log("📡 Monitoring AI code changes...");
console.log("-----------------------------------------");

let isDeploying = false;

const deploy = () => {
    if (isDeploying) return;
    isDeploying = true;
    
    console.log("\n[SYSTEM] Triggering Automatic Production Push...");
    
    // Using absolute paths to prevent "Command not found" errors
    const command = `"${NODE_PATH}" execute_sync.cjs; npx vercel --prod --yes`;
    
    exec(command, { cwd: PROJECT_DIR }, (err, stdout, stderr) => {
        isDeploying = false;
        if (err) {
            console.error(`\n❌ DEPLOYMENT FAILED: ${err.message}`);
            if (stderr) console.error(`Trace: ${stderr}`);
            return;
        }
        console.log("\n✅ PRODUCTION SYNC COMPLETE");
        console.log("🔗 Live URL: https://newhollandfinancial.com");
        if (stdout) console.log(`Logs: ${stdout.substring(0, 100)}...`);
    });
};

// Watch core directories for changes
const targetDirs = ['./pages', './components', './services', './backend'];

targetDirs.forEach(dir => {
    const absoluteDir = path.join(PROJECT_DIR, dir);
    if (fs.existsSync(absoluteDir)) {
        fs.watch(absoluteDir, { recursive: true }, (event, filename) => {
            if (filename && !filename.includes('.git') && !filename.includes('node_modules')) {
                console.log(`\n📄 File Modified: ${filename}`);
                // Wait 500ms to ensure file write is finished
                setTimeout(deploy, 500);
            }
        });
    }
});
