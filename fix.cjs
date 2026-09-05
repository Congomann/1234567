const fs = require('fs');
let code = fs.readFileSync('components/CRMData.tsx', 'utf8');

// Find the useEffect block
const useEffectRegex = /\s*\/\/\s*---\s*AUTO-SCROLL LOGIC\s*---[\s\S]*?\}, \[currentStepIndex, isTourActive, currentStep\?\.targetId\]\);/g;
const match = code.match(useEffectRegex);
if (!match) throw new Error("Could not find useEffect block");

// Remove it from its original place
code = code.replace(match[0], '');

// Find `const currentStep = currentTourSteps[currentStepIndex];`
const currentStepRegex = /(const currentStep = currentTourSteps\[currentStepIndex\];)/;
code = code.replace(currentStepRegex, `$1\n${match[0]}\n`);

fs.writeFileSync('components/CRMData.tsx', code);
console.log('Fixed TDZ in CRMData.tsx');
