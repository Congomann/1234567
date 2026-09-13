const fs = require('fs');
const path = './backend/services/imapMonitor.cjs';
let content = fs.readFileSync(path, 'utf8');

const target = `// Simulates LLM structured extraction based on PRD requirements
function simulateAiClassification(subject, body, from) {`;

const endTarget = `    return result;
}`;

const fullTarget = content.substring(content.indexOf(target), content.indexOf(endTarget) + endTarget.length);

const replacement = `// Regex-based structured extraction based on PRD requirements
function simulateAiClassification(subject, body, from) {
    const text = (subject + " " + body);
    const lowerText = text.toLowerCase();
    
    // Default Unknown
    let result = {
        confidence: 50,
        type: 'Unknown',
        carrierId: 1, // Fallback ID
        advisorName: null,
        advisorEmail: from,
        status: 'Unknown',
        contractNumber: null,
        isCompanyContract: false
    };

    // Attempt to extract real contract number (e.g., ACT-12345 or similar alphanumeric near "contract")
    const contractMatch = text.match(/(?:contract|appointment)\\s*(?:number|#|no)[:\\s]+([A-Z0-9-]+)/i);
    if (contractMatch && contractMatch[1]) {
        result.contractNumber = contractMatch[1];
    }

    // Check for company-level contracts
    if (lowerText.includes("agency agreement") || lowerText.includes("principal") || lowerText.includes("ceo contract")) {
        result.isCompanyContract = true;
        result.type = 'Agency Contract';
        result.confidence = 96;
        return result;
    }

    // Check for standard approvals
    if (lowerText.includes("approved") || lowerText.includes("ready to sell") || lowerText.includes("appointed")) {
        result.status = 'Approved';
        result.confidence = 96;
        result.type = 'Carrier Appointment Approval';
    } else if (lowerText.includes("additional information") || lowerText.includes("missing") || lowerText.includes("needs e&o")) {
        // Check for additional info
        result.status = 'Additional Information Required';
        result.confidence = 90;
        result.type = 'Carrier Pending';
    }

    // Use regex to find potential names if not found by email
    const nameMatch = text.match(/(?:advisor|agent|producer)[:\\s]+([A-Za-z]+\\s[A-Za-z]+)/i);
    if (nameMatch && nameMatch[1]) {
        result.advisorName = nameMatch[1].trim();
    }

    return result;
}`;

content = content.replace(fullTarget, replacement);
fs.writeFileSync(path, content);
