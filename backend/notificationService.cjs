const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

/**
 * NotificationService handles multi-channel alerts (Email, SMS, Push).
 * In development mode, it logs to console and database.
 * In production, it connects to Twilio, Nodemailer, etc.
 */
class NotificationService {
    constructor() {
        this.isProd = process.env.NODE_ENV === 'production';
    }

    /**
     * Sends a notification across multiple channels.
     * @param {Object} options 
     */
    async notify(options) {
        const { userId, title, message, type = 'info', channels = ['push'] } = options;

        console.log(`\n[Notification] To User: ${userId || 'All Admin'}`);
        console.log(`[Notification] Title: ${title}`);
        console.log(`[Notification] Message: ${message}`);

        const results = {};

        if (channels.includes('email')) {
            results.email = await this.sendEmail({ ...options, subject: title });
        }
        if (channels.includes('sms')) {
            results.sms = await this.sendSMS(options);
        }
        if (channels.includes('push')) {
            results.push = await this.sendPush(options);
        }

        return results;
    }

    async sendEmail({ to, subject, body }) {
        if (!this.isProd) {
            console.log(`[Mock Email] To: ${to || 'admin@nhfg.com'}, Subject: ${subject}`);
            return { success: true, provider: 'mock' };
        }
        // TODO: Implement actual Nodemailer logic
        return { success: false, error: 'Not implemented' };
    }

    async sendSMS({ to, message }) {
        if (!this.isProd) {
            console.log(`[Mock SMS] To: ${to || 'Admin Phone'}, Msg: ${message}`);
            return { success: true, provider: 'mock' };
        }
        // TODO: Implement actual Twilio logic
        return { success: false, error: 'Not implemented' };
    }

    async sendPush({ userId, title, message }) {
        console.log(`[Push Notification] Sent to Socket/Client: ${title}`);
        // This is typically handled by the WebSocket broadcast in server.js
        return { success: true };
    }

    /**
     * Specific event trigger for new leads.
     */
    async triggerNewLead(lead) {
        await this.notify({
            title: 'New Lead Received',
            message: `Lead ${lead.name} interested in ${lead.interest}. Score: ${lead.score || 'N/A'}`,
            type: 'success',
            channels: ['push', 'email']
        });
    }

    /**
     * Specific event trigger for status changes.
     */
    async triggerStatusChange(lead, newStatus) {
        await this.notify({
            title: 'Lead Status Updated',
            message: `Lead ${lead.name} is now in '${newStatus}' stage.`,
            type: 'info',
            channels: ['push']
        });
    }
}

module.exports = new NotificationService();
