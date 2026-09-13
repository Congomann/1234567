const fs = require('fs');
const path = './services/apiBackend.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `    async submitApplication(submissionData: any): Promise<any> {
        if (USE_REAL_BACKEND) {
            try {
                const res = await fetch(this.baseUrl + '/contracting/submissions', {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(submissionData)
                });
                return await this.handleResponse(res);
            } catch(e) {}
        }
        return { success: true, tracking_id: 'BL-MOCK-123' };
    }`;

const replacement = `    async submitApplication(submissionData: any): Promise<any> {
        const res = await fetch(this.baseUrl + '/contracting/submissions', {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(submissionData)
        });
        return await this.handleResponse(res);
    }`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
