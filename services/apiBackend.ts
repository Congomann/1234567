
import { Lead, ProductType, LeadStatus, User, UserRole, Commission, Client, CompanySettings, IntegrationLog, Workflow } from '../types';
import { InternalLead, Transformers, IngestionEngine } from './marketingBackend';
import { DB } from './database';

// --- CONFIGURATION ---
const USE_REAL_BACKEND = true;

/**
 * NHFG BACKEND CORE
 * Seamlessly switches between local browser storage and production API.
 * Standardized Fallback Pattern: Try API -> Silent Fallback if unreachable/404 -> Error only on logic failure
 */
class NHFGBackend {

    private get baseUrl(): string {
        return '/api';
    }

    private getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('nhfg_jwt_token');
        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    private async handleResponse(res: Response, silent = false) {
        if (res.status === 401) {
            if (!silent) {
                const hasToken = localStorage.getItem('nhfg_jwt_token');
                if (hasToken) {
                    this.logout();
                    window.location.href = '/login';
                }
            }
            throw new Error('Session expired');
        }

        if (!res.ok) {
            let errorMessage = `HTTP Error ${res.status}: ${res.statusText || 'Unknown Status'}`;

            try {
                // Attempt to parse JSON error detail
                const text = await res.clone().text();
                const errorData = JSON.parse(text);
                errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
                console.error(`[Backend Response Error JSON]`, errorData);
            } catch (e) {
                // If not JSON, attempt to read as plain text
                try {
                    const text = await res.clone().text();
                    if (text) {
                        errorMessage = text.length < 150 ? text : `HTTP Error ${res.status}: (Body too large)`;
                        console.error(`[Backend Response Error Text]`, text);
                    }
                } catch (textErr) { }
            }

            throw new Error(errorMessage);
        }

        return res.json();
    }

    // Helper to wrap API calls with IndexedDB fallback
    private async apiRequest<T>(url: string, options: RequestInit, fallbackStore: string): Promise<T> {
        if (!USE_REAL_BACKEND) return DB.getAll<any>(fallbackStore) as any;

        try {
            const res = await fetch(url, options);
            return await this.handleResponse(res);
        } catch (e: any) {
            const isNetworkError = e instanceof TypeError;
            const isNotFound = e.message.includes('404') || e.message.toLowerCase().includes('not found');

            // If it's a connectivity issue or a missing endpoint, fall back silently
            if (isNetworkError || isNotFound) {
                console.debug(`[Backend] API ${isNotFound ? 'endpoint 404' : 'unreachable'}. Falling back to local storage for: ${fallbackStore}`);
            } else {
                // Real logic or server-side error (500, 403, etc.)
                console.error(`[Backend] API Error: ${e.message}`);
            }

            return DB.getAll<any>(fallbackStore) as any;
        }
    }

    // --- AUTHENTICATION ---

    async getCurrentUser(): Promise<User | null> {
        if (!USE_REAL_BACKEND || !localStorage.getItem('nhfg_jwt_token')) return null;
        try {
            const res = await fetch(`${this.baseUrl}/auth/me`, {
                headers: this.getAuthHeaders()
            });
            return await this.handleResponse(res, true);
        } catch (e) {
            return null;
        }
    }

    async login(email: string, password?: string): Promise<User | null> {
        if (!USE_REAL_BACKEND) return null;
        try {
            const res = await fetch(`${this.baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: password || 'password' })
            });
            const data = await this.handleResponse(res);
            if (data.access_token) {
                localStorage.setItem('nhfg_jwt_token', data.access_token);
            }
            return data.user;
        } catch (e: any) {
            if (!(e instanceof TypeError) && !e.message.includes('404')) {
                console.warn(`[Backend] Login API Exception: ${e.message}`);
            }
            return null;
        }
    }

    logout() {
        localStorage.removeItem('nhfg_jwt_token');
    }

    // --- ENTITY MANAGEMENT ---

    async getLeads(advisorId?: string): Promise<Lead[]> {
        const url = advisorId ? `${this.baseUrl}/leads?advisorId=${advisorId}` : `${this.baseUrl}/leads`;
        return this.apiRequest<Lead[]>(url, { headers: this.getAuthHeaders() }, 'leads');
    }

    async saveLead(lead: Partial<Lead>): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/leads`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(lead)
                });
            } catch (e) { }
        }
        await DB.save('leads', { ...lead, id: lead.id || crypto.randomUUID() } as Lead);
    }

    async getClients(): Promise<Client[]> {
        return this.apiRequest<Client[]>(`${this.baseUrl}/clients`, { headers: this.getAuthHeaders() }, 'clients');
    }

    async saveClient(client: Client): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/clients`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(client)
                });
            } catch (e) { }
        }
        await DB.save('clients', client);
    }

    async getUsers(): Promise<User[]> {
        return this.apiRequest<User[]>(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() }, 'users');
    }

    async saveUser(user: User): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/users`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(user)
                });
            } catch (e) { }
        }
        await DB.save('users', user);
    }

    async getSettings(): Promise<CompanySettings | null> {
        const settings = await this.apiRequest<CompanySettings[]>(`${this.baseUrl}/settings`, { headers: this.getAuthHeaders() }, 'settings');
        return settings && settings.length > 0 ? settings[0] : null;
    }

    async saveSettings(settings: CompanySettings): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch(`${this.baseUrl}/settings`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(settings)
            });
            await this.handleResponse(res);
        }
        await DB.save('settings', { ...settings, id: 'main' } as any);
    }

    async getLogs(): Promise<IntegrationLog[]> {
        return this.apiRequest<IntegrationLog[]>(`${this.baseUrl}/logs`, { headers: this.getAuthHeaders() }, 'logs');
    }

    async getWorkflows(): Promise<Workflow[]> {
        return this.apiRequest<Workflow[]>(`${this.baseUrl}/workflows`, { headers: this.getAuthHeaders() }, 'workflows');
    }

    async saveWorkflow(workflow: Workflow): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/workflows`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(workflow)
                });
            } catch (e) { }
        }
        await DB.save('workflows', workflow);
    }

    async getEvents(): Promise<any[]> {
        return this.apiRequest<any[]>(`${this.baseUrl}/events`, { headers: this.getAuthHeaders() }, 'events');
    }

    async saveEvent(event: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/events`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(event)
                });
            } catch (e) { }
        }
        await DB.save('events', event);
    }

    async deleteEvent(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/events/${id}`, {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                });
            } catch (e) { }
        }
        await DB.delete('events', id);
    }

    // --- LANDING PAGES ---

    async getLandingPages(): Promise<any[]> {
        return this.apiRequest<any[]>(`${this.baseUrl}/admin/landing-pages`, { headers: this.getAuthHeaders() }, 'landing_pages');
    }

    async saveLandingPage(page: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch(`${this.baseUrl}/admin/landing-pages`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(page)
            });
            await this.handleResponse(res);
        }
        await DB.save('landing_pages', page);
    }

    // --- RESOURCES ---

    async getResources(): Promise<any[]> {
        return this.apiRequest<any[]>(`${this.baseUrl}/resources`, { headers: this.getAuthHeaders() }, 'resources');
    }

    async saveResource(resource: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/resources`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(resource)
                });
            } catch (e) { }
        }
        await DB.save('resources', { ...resource, id: resource.id || crypto.randomUUID() });
    }

    async deleteResource(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/resources/${id}`, {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                });
            } catch (e) { }
        }
        await DB.delete('resources', id);
    }

    // --- TESTIMONIALS ---

    async getTestimonials(): Promise<any[]> {
        return this.apiRequest<any[]>(`${this.baseUrl}/testimonials`, { headers: this.getAuthHeaders() }, 'testimonials');
    }

    async saveTestimonial(testimonial: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/testimonials`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(testimonial)
                });
            } catch (e) { }
        }
        await DB.save('testimonials', { ...testimonial, id: testimonial.id || crypto.randomUUID() });
    }

    async approveTestimonial(id: string, status: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/testimonials/${id}/approve`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify({ status })
                });
            } catch (e) { }
        }
        const t = await DB.get<any>('testimonials', id);
        if (t) await DB.save('testimonials', { ...t, status });
    }

    async requestTestimonialEdit(id: string, edits: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/testimonials/${id}/edit`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(edits)
                });
            } catch (e) { }
        }
        const t = await DB.get<any>('testimonials', id);
        if (t) await DB.save('testimonials', { ...t, ...edits, status: 'pending_edit' });
    }

    async deleteTestimonial(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/testimonials/${id}`, {
                    method: 'DELETE',
                    headers: this.getAuthHeaders()
                });
            } catch (e) { }
        }
        await DB.delete('testimonials', id);
    }

    // --- GENERIC HTTP METHODS ---
    async get<T>(path: string): Promise<T> {
        const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        return this.apiRequest<T>(url, { headers: this.getAuthHeaders() }, path.replace(/\//g, '_'));
    }

    async post<T>(path: string, body: any): Promise<T> {
        const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        console.log(`[Backend POST] ${url}`, body);
        const options: RequestInit = {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify(body)
        };
        const res = await fetch(url, options);
        return await this.handleResponse(res);
    }

    async uploadFile(filename: string, fileData: string): Promise<string> {
        const data = await this.post<{ url: string }>('/upload', { filename, fileData });
        return data.url;
    }


}

export const Backend = new NHFGBackend();
