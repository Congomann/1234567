const fs = require('fs');
let code = fs.readFileSync('services/apiBackend.ts', 'utf8');

const additionalMethods = `
    // --- TASKS ---
    async getTasks(): Promise<any[]> {
        return this.apiRequest<any[]>( \`\${this.baseUrl}/tasks\`, { headers: this.getAuthHeaders() }, 'tasks' );
    }
    
    async saveTask(task: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch( \`\${this.baseUrl}/tasks\`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(task)
                });
            } catch (e) { }
        }
        await DB.save('tasks', task);
    }
    
    async deleteTask(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch( \`\${this.baseUrl}/tasks/\${id}\`, { method: 'DELETE', headers: this.getAuthHeaders() });
            } catch (e) {}
        }
        await DB.delete('tasks', id);
    }

    // --- PORTFOLIOS ---
    async getPortfolios(): Promise<any[]> {
        return this.apiRequest<any[]>( \`\${this.baseUrl}/portfolios\`, { headers: this.getAuthHeaders() }, 'portfolios' );
    }

    async savePortfolio(portfolio: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch( \`\${this.baseUrl}/portfolios\`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(portfolio)
                });
            } catch (e) { }
        }
        await DB.save('portfolios', portfolio);
    }

    // --- APPLICATIONS / POLICIES ---
    async getApplications(): Promise<any[]> {
        return this.apiRequest<any[]>( \`\${this.baseUrl}/applications\`, { headers: this.getAuthHeaders() }, 'applications' );
    }

    async saveApplication(application: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch( \`\${this.baseUrl}/applications\`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(application)
                });
            } catch (e) { }
        }
        await DB.save('applications', application);
    }

    async deleteClient(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch( \`\${this.baseUrl}/clients/\${id}\`, { method: 'DELETE', headers: this.getAuthHeaders() });
            } catch (e) {}
        }
        await DB.delete('clients', id);
    }
`;

// Insert right before the last closing brace of the NHFGBackend class.
// We can find the end of the class easily by looking for `export const Backend = new NHFGBackend();`
code = code.replace(/export const Backend = new NHFGBackend\(\);/, additionalMethods + '\n}\n\nexport const Backend = new NHFGBackend();');
// Wait, the class closes with a `}` before `export const Backend`. I will replace `}\n\nexport const Backend`
fs.writeFileSync('services/apiBackend.ts', code);
console.log("Injected frontend API methods!");
