const fs = require('fs');
const path = require('path');

const { createClient } = require('webdav');
const encryptionService = require('./encryptionService.cjs');
 
/**
 * StorageService handles file persistence.
 * Currently supports: 'local', 'owncloud'
 */
class StorageService {
    constructor() {
        // Use /tmp if deployed on Vercel Serverless (read-only filesystem), else local
        const isVercel = !!process.env.VERCEL;
        this.baseDir = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');
        if (!fs.existsSync(this.baseDir)) {
            fs.mkdirSync(this.baseDir, { recursive: true });
        }
        
        this.mode = process.env.STORAGE_MODE || 'local';
        this.owncloudUrl = process.env.OWNCLOUD_URL;
        this.owncloudUser = process.env.OWNCLOUD_USERNAME;
        this.owncloudPass = process.env.OWNCLOUD_PASSWORD;
 
        if (this.mode === 'owncloud' && this.owncloudUrl) {
            console.log(`[Storage] Initializing ownCloud client at ${this.owncloudUrl}`);
            this.client = createClient(this.owncloudUrl, {
                username: this.owncloudUser,
                password: this.owncloudPass
            });
        }
    }
 
    async saveFile(filename, base64Data) {
        // ENCRYPTION AT REST: Encrypt the buffer before any persistence
        const buffer = Buffer.from(base64Data.split(',').pop(), 'base64');
        const encryptedData = encryptionService.encrypt(buffer);
        const encryptedBuffer = Buffer.from(encryptedData);

        if (this.mode === 'owncloud' && this.client) {
            try {
                return await this.saveToOwnCloud(filename, encryptedBuffer);
            } catch (error) {
                console.error('[Storage] ownCloud save failed, falling back to local:', error);
                return this.saveLocal(filename, encryptedBuffer);
            }
        }
        return this.saveLocal(filename, encryptedBuffer);
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
 
    async saveToOwnCloud(filename, buffer) {
        try {
            const cleanName = filename.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
            
            console.log(`[Storage] Uploading ${cleanName} to ownCloud...`);
            await this.client.putFileContents(`/${cleanName}`, buffer);
            
            // Quick approach: Save locally AND to cloud.
            await this.saveLocal(filename, buffer);
            return `/api/storage/${cleanName}`;
        } catch (error) {
            console.error('[Storage] ownCloud PUT error:', error);
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

        // 2. If missing locally but in ownCloud mode, fetch from cloud
        if (this.mode === 'owncloud' && this.client) {
            try {
                console.log(`[Storage] Local miss for ${cleanName}, fetching from ownCloud...`);
                const buffer = await this.client.getFileContents(`/${cleanName}`);
                fs.writeFileSync(filePath, buffer); // Cache locally for next time
                return filePath;
            } catch (error) {
                console.error(`[Storage] ownCloud fetch error for ${cleanName}:`, error);
                return null;
            }
        }

        return null;
    }
}

module.exports = new StorageService();
