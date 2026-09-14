const fs = require('fs');
let content = fs.readFileSync('services/apiBackend.ts', 'utf8');

const newMethods = `
    async getCarrierPackages(): Promise<any[]> {
        if (USE_REAL_BACKEND) {
            try {
                const res = await fetch(this.baseUrl + '/contracting/packages', {
                    headers: this.getAuthHeaders()
                });
                if (res.ok) return await res.json();
            } catch (e) {}
        }
        return await DB.getAll('carrier_packages') || [];
    }

    async addCarrierPackage(pkg: any): Promise<any> {
        if (USE_REAL_BACKEND) {
            try {
                const res = await fetch(this.baseUrl + '/contracting/packages', {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(pkg)
                });
                if (res.ok) return await res.json();
            } catch (e) {}
        }
        const newPkg = { id: Date.now().toString(), ...pkg, created_at: new Date().toISOString() };
        await DB.save('carrier_packages', newPkg);
        return newPkg;
    }

    async getAutosavedSubmissions(): Promise<any[]> {
        return await DB.getAll('contracting_submissions') || [];
    }
    
    async autosaveSubmission(submission: any): Promise<any> {
        await DB.save('contracting_submissions', submission);
        return submission;
    }
`;

if (!content.includes('getCarrierPackages')) {
    content = content.replace('async getActiveCarriers()', newMethods + '\n    async getActiveCarriers()');
    fs.writeFileSync('services/apiBackend.ts', content);
    console.log('Added package methods to apiBackend');
}
