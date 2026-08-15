
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
        const token = localStorage.getItem('nhfg_access_token');
        const mockUserId = localStorage.getItem('nhfg_mock_user_id');
        const headers: { [key: string]: string } = { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        if (mockUserId) {
            headers['x-mock-user-id'] = mockUserId;
        }
        
        return headers;
    }

    private async handleResponse(res: Response, silent = false, originalRequest?: () => Promise<any>): Promise<any> {
        if (res.status === 401) {
            const data = await res.clone().json().catch(() => ({}));
            
            // If it's a token expiration and we have a retry function
            if (data.code === 'TOKEN_EXPIRED' && originalRequest) {
                console.log('[Backend] Access token expired, attempting refresh...');
                const refreshed = await this.refreshTokens();
                if (refreshed) {
                    return originalRequest();
                }
            }

            if (!silent) {
                const hasToken = localStorage.getItem('nhfg_access_token');
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
                        // Truncate only if extremely long, but keep the actual error content
                        errorMessage = text.length < 500 ? text : `${text.substring(0, 500)}... (Truncated)`;
                        console.error(`[Backend Response Error Text]`, text);
                    }
                } catch (textErr) { }
            }

            throw new Error(errorMessage);
        }

        return res.json();
    }

    private async refreshTokens(): Promise<boolean> {
        const refreshToken = localStorage.getItem('nhfg_refresh_token');
        if (!refreshToken) return false;

        try {
            const res = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            });
            
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('nhfg_access_token', data.access_token);
                return true;
            }
        } catch (e) {
            console.error('[Backend] Refresh failed:', e);
        }
        
        this.logout();
        return false;
    }

    // Helper to wrap API calls with IndexedDB fallback
    public async apiRequest<T>(url: string, options: RequestInit, fallbackStore: string): Promise<T> {
        if (!USE_REAL_BACKEND) return DB.getAll<any>(fallbackStore) as any;

        try {
            const executeRequest = () => fetch(url, { ...options, headers: this.getAuthHeaders() });
            const res = await executeRequest();
            return await this.handleResponse(res, false, () => this.apiRequest(url, options, fallbackStore));
        } catch (e: any) {
            const isNetworkError = e instanceof TypeError;
            const isNotFound = e.message.includes('404') || e.message.toLowerCase().includes('not found');

            // If it's a connectivity issue or a missing endpoint, fall back silently
            if (isNetworkError || isNotFound) {
                console.debug(`[Backend] API ${isNotFound ? 'endpoint 404' : 'unreachable'}. Falling back to local storage for: ${fallbackStore}`);
            } else {
                // Real logic or server-side error (500, 403, etc.)
                console.error(`[Backend] API Error: ${e.message}`);
                if (e.message === 'Session expired') throw e;
            }

            return DB.getAll<any>(fallbackStore) as any;
        }
    }

    // --- AUTHENTICATION ---

    async getCurrentUser(): Promise<User | null> {
        if (!USE_REAL_BACKEND || !localStorage.getItem('nhfg_access_token')) return null;
        try {
            const res = await fetch(`${this.baseUrl}/auth/me`, {
                headers: this.getAuthHeaders()
            });
            return await this.handleResponse(res, true, () => this.getCurrentUser());
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
                localStorage.setItem('nhfg_access_token', data.access_token);
                localStorage.setItem('nhfg_refresh_token', data.refresh_token);
            }
            return data.user;
        } catch (e: any) {
            console.warn(`[Backend] Login API Exception: ${e.message}`);
            return null;
        }
    }

    async register(email: string, password?: string, name?: string, role?: string): Promise<User | null> {
        if (!USE_REAL_BACKEND) return null;
        try {
            const res = await fetch(`${this.baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: password || 'password', name, role })
            });
            const data = await this.handleResponse(res);
            if (data.access_token) {
                localStorage.setItem('nhfg_access_token', data.access_token);
                localStorage.setItem('nhfg_refresh_token', data.refresh_token);
            }
            return data.user;
        } catch (e: any) {
            console.warn(`[Backend] Register API Exception: ${e.message}`);
            return null;
        }
    }

    async resetPassword(email: string): Promise<boolean> {
        if (!USE_REAL_BACKEND) return false;
        try {
            const res = await fetch(`${this.baseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            await this.handleResponse(res);
            return true;
        } catch (e: any) {
            console.warn(`[Backend] Reset Password API Exception: ${e.message}`);
            return false;
        }
    }

    async logout() {
        const refreshToken = localStorage.getItem('nhfg_refresh_token');
        if (refreshToken && USE_REAL_BACKEND) {
            fetch(`${this.baseUrl}/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken })
            }).catch(() => {});
        }
        localStorage.removeItem('nhfg_access_token');
        localStorage.removeItem('nhfg_refresh_token');
        localStorage.removeItem('nhfg_access_token'); // Clean up old token if exists
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

    async savePublicLead(lead: Partial<Lead>): Promise<any> {
        return this.post('/leads/public', lead);
    }

    async saveCallback(callback: any): Promise<any> {
        return this.post('/callbacks', callback);
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

    async deleteUser(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch(`${this.baseUrl}/users/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse(res);
        }
        await DB.delete('users', id);
    }

    async getSettings(): Promise<CompanySettings | null> {
        const settings = await this.apiRequest<CompanySettings[]>(`${this.baseUrl}/settings`, { headers: this.getAuthHeaders() }, 'settings');
        return settings && settings.length > 0 ? settings[0] : null;
    }

    async saveSettings(settings: CompanySettings): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                const res = await fetch(`${this.baseUrl}/settings`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(settings)
                });
                await this.handleResponse(res);
            } catch (e) {
                console.warn('[API] Real backend offline for saveSettings. Falling back to local DB.', e);
            }
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
            const res = await fetch(`${this.baseUrl}/events/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse(res);
        }
        await DB.delete('events', id);
    }

    // --- LANDING PAGES ---

    async getLandingPages(): Promise<any[]> {
        return this.apiRequest<any[]>(`${this.baseUrl}/admin/landing-pages`, { headers: this.getAuthHeaders() }, 'landing_pages');
    }

    async saveLandingPage(page: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                const res = await fetch(`${this.baseUrl}/admin/landing-pages`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(page)
                });
                await this.handleResponse(res);
            } catch (e) {
                console.warn('[API] Real backend offline for saveLandingPage. Falling back to local DB.', e);
            }
        }
        await DB.save('landing_pages', page);
    }

    async deleteAdvisorApplication(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch(`${this.baseUrl}/admin/onboarding/applications/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse(res);
        }
        await DB.delete('advisor_applications', id);
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
            const res = await fetch(`${this.baseUrl}/resources/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse(res);
        }
        await DB.delete('resources', id);
    }

    async likeResource(id: string): Promise<any> {
        return this.post(`/resources/${id}/like`, {});
    }

    async dislikeResource(id: string): Promise<any> {
        return this.post(`/resources/${id}/dislike`, {});
    }

    async addResourceComment(id: string, text: string, userName?: string): Promise<any> {
        return this.post(`/resources/${id}/comment`, { text, userName });
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
            const res = await fetch(`${this.baseUrl}/testimonials/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            await this.handleResponse(res);
        }
        await DB.delete('testimonials', id);
    }

    // --- GENERIC HTTP METHODS ---
    async get<T>(path: string): Promise<T> {
        const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
        const cleanStore = path.startsWith('/chat/channels') ? 'chat_channels' :
                           path.startsWith('/chat/messages') ? 'chat_messages' :
                           path.startsWith('/case-notes') ? 'case_notes' :
                           path.startsWith('/events') ? 'events' :
                           path.replace(/\//g, '_');
        return this.apiRequest<T>(url, { headers: this.getAuthHeaders() }, cleanStore);
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

    async uploadFormData(file: File): Promise<string> {
        const url = `${this.baseUrl}/upload-multipart`;
        const formData = new FormData();
        formData.append('file', file);
        
        const headers = this.getAuthHeaders();
        // Remove Content-Type so browser sets it correctly with boundary
        delete (headers as any)['Content-Type'];

        const res = await fetch(url, {
            method: 'POST',
            headers,
            body: formData
        });
        const data = await this.handleResponse(res);
        return data.url;
    }

    async uploadDirectToSupabase(file: File): Promise<string> {
        try {
            // 1. Try direct Supabase Signed Upload URL
            const res = await fetch(`${this.baseUrl}/upload/signed-url`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ filename: file.name })
            });
            if (res.ok) {
                const data = await this.handleResponse(res);
                const { signedUrl, token, path, publicUrl } = data;

                const { supabase } = await import('./supabaseClient');
                const { data: uploadData, error } = await supabase.storage
                    .from('uploads')
                    .uploadToSignedUrl(path, token, file);

                if (!error) {
                    console.log(`[Upload-Direct] File saved via signed URL: ${publicUrl}`);
                    return publicUrl;
                }
                console.warn('[Upload-Direct] Signed upload error, attempting multipart upload:', error?.message);
            }
        } catch (err: any) {
            console.warn('[Upload-Direct] Signed upload bypass error, falling back to multipart:', err?.message);
        }

        // Fallback: Use standard multipart form-data upload endpoint (up to 500MB supported)
        return this.uploadFormData(file);
    }

    // --- ACCESS LOGS ---
    async getAccessLogs(): Promise<any[]> {
        return this.apiRequest<any[]>(`${this.baseUrl}/admin/access-logs`, { headers: this.getAuthHeaders() }, 'access_logs');
    }

    // --- DOCUMENTS ---
    async getDocuments(clientId?: string): Promise<any[]> {
        const url = clientId ? `${this.baseUrl}/documents?clientId=${clientId}` : `${this.baseUrl}/documents`;
        return this.apiRequest<any[]>(url, { headers: this.getAuthHeaders() }, 'documents');
    }

    async saveDocument(doc: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/documents`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(doc)
                });
            } catch (e) { }
        }
        await DB.save('documents', doc);
    }

    // --- INTERACTIONS ---
    async getInteractions(leadId?: string, clientId?: string): Promise<any[]> {
        let url = `${this.baseUrl}/interactions?`;
        if (leadId) url += `leadId=${leadId}&`;
        if (clientId) url += `clientId=${clientId}`;
        return this.apiRequest<any[]>(url, { headers: this.getAuthHeaders() }, 'interactions');
    }

    async saveInteraction(interaction: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/interactions`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(interaction)
                });
            } catch (e) { }
        }
        await DB.save('interactions', interaction);
    }

    // --- PREFERENCES ---
    async getPreferences(): Promise<any> {
        return this.apiRequest<any>(`${this.baseUrl}/preferences`, { headers: this.getAuthHeaders() }, 'preferences');
    }

    async savePreferences(prefs: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch(`${this.baseUrl}/preferences`, {
                    method: 'POST',
                    headers: this.getAuthHeaders(),
                    body: JSON.stringify(prefs)
                });
            } catch (e) { }
        }
        await DB.save('preferences', prefs);
    }
    
    // --- TASKS ---
    async getTasks(): Promise<any[]> {
        return this.apiRequest<any[]>( `${this.baseUrl}/tasks`, { headers: this.getAuthHeaders() }, 'tasks' );
    }
    
    async saveTask(task: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch( `${this.baseUrl}/tasks`, {
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
            const res = await fetch( `${this.baseUrl}/tasks/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
            await this.handleResponse(res);
        }
        await DB.delete('tasks', id);
    }

    // --- PORTFOLIOS ---
    async getPortfolios(): Promise<any[]> {
        return this.apiRequest<any[]>( `${this.baseUrl}/portfolios`, { headers: this.getAuthHeaders() }, 'portfolios' );
    }

    async savePortfolio(portfolio: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch( `${this.baseUrl}/portfolios`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(portfolio)
            });
            await this.handleResponse(res);
        }
        await DB.save('portfolios', portfolio);
    }

    async deletePortfolio(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch( `${this.baseUrl}/portfolios/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
            await this.handleResponse(res);
        }
        await DB.delete('portfolios', id);
    }

    // --- REAL ESTATE ---
    async getProperties(): Promise<any[]> {
        return this.apiRequest<any[]>( `${this.baseUrl}/real-estate/properties`, { headers: this.getAuthHeaders() }, 'properties' );
    }

    async saveProperty(property: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch( `${this.baseUrl}/real-estate/properties`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(property)
            });
            await this.handleResponse(res);
        }
        await DB.save('properties', property);
    }

    async deleteProperty(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch( `${this.baseUrl}/real-estate/properties/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
            await this.handleResponse(res);
        }
        await DB.delete('properties', id);
    }

    // --- APPLICATIONS / POLICIES ---
    async getApplications(): Promise<any[]> {
        return this.apiRequest<any[]>( `${this.baseUrl}/applications`, { headers: this.getAuthHeaders() }, 'applications' );
    }

    async saveApplication(application: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            try {
                await fetch( `${this.baseUrl}/applications`, {
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
            const res = await fetch( `${this.baseUrl}/clients/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
            await this.handleResponse(res);
        }
        await DB.delete('clients', id);
    }

    // --- LOGISTICS & LOADS ---
    async getLoads(): Promise<any[]> {
        return this.apiRequest<any[]>( `${this.baseUrl}/logistics/loads`, { headers: this.getAuthHeaders() }, 'logistics_loads' );
    }

    async saveLoad(load: any): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch( `${this.baseUrl}/logistics/loads`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(load)
            });
            await this.handleResponse(res);
        }
        await DB.save('logistics_loads', load);
    }

    async deleteLoad(id: string): Promise<void> {
        if (USE_REAL_BACKEND) {
            const res = await fetch( `${this.baseUrl}/logistics/loads/${id}`, { method: 'DELETE', headers: this.getAuthHeaders() });
            await this.handleResponse(res);
        }
        await DB.delete('logistics_loads', id);
    }

}

export const Backend = new NHFGBackend();
