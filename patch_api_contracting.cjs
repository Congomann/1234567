const fs = require('fs');
const path = './services/apiBackend.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `    async deleteUser(id: string): Promise<void> {`;
const replacement = `    // --- CONTRACTING & CARRIERS ---
    async getActiveCarriers(): Promise<any[]> {
        return this.apiRequest<any[]>('/carriers', { headers: this.getAuthHeaders() }, 'carriers');
    }

    async getCarrierDetails(id: string): Promise<any> {
        return this.apiRequest<any>('/carriers/' + id, { headers: this.getAuthHeaders() }, 'carrier_details');
    }

    async submitApplication(submissionData: any): Promise<any> {
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
    }

    async getMySubmissions(): Promise<any[]> {
        return this.apiRequest<any[]>('/contracting/submissions/me', { headers: this.getAuthHeaders() }, 'my_submissions');
    }

    async deleteUser(id: string): Promise<void> {`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
