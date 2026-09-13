const fs = require('fs');
const path = './services/apiBackend.ts';
let content = fs.readFileSync(path, 'utf8');

const target = `    async deleteUser(id: string): Promise<void> {`;
const replacement = `    // --- CARRIERS ---
    async getCarriers(): Promise<any[]> {
        return this.apiRequest<any[]>('/carriers', { headers: this.getAuthHeaders() }, 'carriers');
    }

    async addCarrier(name: string, category: string): Promise<any> {
        const newCarrier = { name, category };
        if (USE_REAL_BACKEND) {
            try {
                await fetch(this.baseUrl + '/carriers', {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(newCarrier)
                });
            } catch (e) {}
        }
        await DB.save('carriers', { id: name, name, category }); // Use name as ID for simplicity
        return newCarrier;
    }

    async deleteCarrier(name: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(this.baseUrl + '/carriers/' + encodeURIComponent(name), {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                });
            } catch (e) {}
        }
        await DB.delete('carriers', name);
    }

    async deleteUser(id: string): Promise<void> {`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
