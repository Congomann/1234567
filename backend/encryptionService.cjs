const crypto = require('crypto');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/**
 * EncryptionService provides AES-256-GCM encryption/decryption.
 * Used for securing sensitive data at rest (database fields, files).
 */
class EncryptionService {
    constructor() {
        // ENCRYPTION_KEY must be 32 bytes (256 bits).
        // For demo/dev, we use a fallback, but in prod it MUST be in .env
        this.key = process.env.ENCRYPTION_KEY ? 
            Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : 
            crypto.scryptSync('nhfg-default-secret-key', 'salt', 32);
        
        this.algorithm = 'aes-256-gcm';
        this.ivLength = 16;
        this.saltLength = 64;
        this.tagLength = 16;
    }

    /**
     * Encrypts a string or buffer.
     * @param {string|Buffer} data 
     * @returns {string} Encrypted data in format: iv:tag:content (hex)
     */
    encrypt(data) {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        
        const encrypted = Buffer.concat([
            cipher.update(typeof data === 'string' ? Buffer.from(data) : data),
            cipher.final()
        ]);
        
        const tag = cipher.getAuthTag();
        
        return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
    }

    /**
     * Decrypts data encrypted by this service.
     * @param {string} encryptedData format: iv:tag:content
     * @returns {Buffer} Decrypted data
     */
    decrypt(encryptedData) {
        const [ivHex, tagHex, contentHex] = encryptedData.split(':');
        if (!ivHex || !tagHex || !contentHex) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const content = Buffer.from(contentHex, 'hex');
        
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        decipher.setAuthTag(tag);
        
        return Buffer.concat([
            decipher.update(content),
            decipher.final()
        ]);
    }

    /**
     * Helper to encrypt a JSON object.
     */
    encryptJSON(obj) {
        return this.encrypt(JSON.stringify(obj));
    }

    /**
     * Helper to decrypt into a JSON object.
     */
    decryptJSON(encryptedData) {
        const decrypted = this.decrypt(encryptedData);
        return JSON.parse(decrypted.toString());
    }
}

module.exports = new EncryptionService();
