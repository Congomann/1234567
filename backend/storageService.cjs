const fs = require('fs');
const path = require('path');
const encryptionService = require('./encryptionService.cjs');
 
/**
 * StorageService handles file persistence.
 * Relies on Supabase Storage for persistent cloud storage and local storage as fallback.
 */
class StorageService {
    constructor() {
        // Use /tmp if deployed on Vercel Serverless (read-only filesystem), else local
        const isVercel = !!process.env.VERCEL;
        this.baseDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
    }
 
    async saveFile(filename, base64Data) {
        const buffer = Buffer.from(base64Data.split(',').pop(), 'base64');
        return this.saveBuffer(filename, buffer);
    }

    async saveBuffer(filename, buffer, mimetype = 'application/octet-stream') {
        // Try Supabase Storage first for persistent cloud storage
        try {
            const supabase = require('./supabaseClient.cjs');
            const cleanName = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
            const { data, error } = await supabase.storage
                .from('uploads')
                .upload(cleanName, buffer, {
                    upsert: true,
                    contentType: mimetype
                });
            
            if (!error) {
                // Return public URL if bucket is public, else proxy via API
                const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(cleanName);
                console.log(`[Storage] Saved to Supabase: ${publicUrl}`);
                return publicUrl;
            } else {
                console.warn('[Storage] Supabase upload failed, falling back:', error.message);
            }
        } catch (e) {
            console.warn('[Storage] Supabase integration error:', e.message);
        }

        return this.saveLocal(filename, buffer);
    }
 
    async saveLocal(filename, buffer) {
        try {
            const cleanName = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
            const filePath = path.join(this.baseDir, cleanName);
            fs.writeFileSync(filePath, buffer);
            return `/api/storage/${cleanName}`;
        } catch (error) {
            console.error('[Storage] Local save error:', error);
            throw error;
        }
    }
 
    async getFile(filename) {
        const cleanName = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const filePath = path.join(this.baseDir, cleanName);

        // 1. Check local cache first
        if (fs.existsSync(filePath)) {
            return filePath;
        }

        // 2. If missing locally, try fetching from Supabase Storage
        try {
            const supabase = require('./supabaseClient.cjs');
            console.log(`[Storage] Local miss for ${cleanName}, fetching from Supabase...`);
            const { data, error } = await supabase.storage
                .from('uploads')
                .download(cleanName);

            if (!error && data) {
                const buffer = Buffer.from(await data.arrayBuffer());
                fs.writeFileSync(filePath, buffer); // Cache locally for next time
                return filePath;
            } else {
                console.error(`[Storage] Supabase download error for ${cleanName}:`, error?.message);
            }
        } catch (error) {
            console.error(`[Storage] Supabase fetch error for ${cleanName}:`, error.message);
        }

        return null;
    }
}

module.exports = new StorageService();

