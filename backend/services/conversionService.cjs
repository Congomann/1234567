const axios = require('axios');
require('dotenv').config();

class ConversionService {
  /**
   * Trigger conversions to external ad platforms
   * @param {Object} lead - The lead object that was converted
   */
  async reportConversion(lead) {
    if (!lead || !lead.id) {
      console.warn('[ConversionService] No lead provided to report.');
      return;
    }

    try {
      console.log(`[ConversionService] Reporting conversion for lead ${lead.id} with source: ${lead.source}`);
      
      const source = lead.source ? lead.source.toLowerCase() : '';
      
      if (source.includes('meta') || source.includes('facebook') || source.includes('ig')) {
        await this.triggerMetaConversion(lead);
      } else if (source.includes('google')) {
        await this.triggerGoogleConversion(lead);
      } else {
        console.log(`[ConversionService] Source ${lead.source} does not have a specific conversion loop implemented.`);
      }

    } catch (error) {
      console.error('[ConversionService] Error reporting conversion:', error);
    }
  }

  async triggerMetaConversion(lead) {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
      console.warn('[ConversionService] Meta Conversions API keys not configured. Skipping Meta conversion.');
      return;
    }

    const payload = {
      data: [
        {
          event_name: 'Lead',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'system_generated',
          user_data: {
            em: lead.email ? this.hashData(lead.email.toLowerCase().trim()) : undefined,
            ph: lead.phone ? this.hashData(lead.phone.replace(/\D/g, '')) : undefined,
            external_id: [lead.id]
          },
          custom_data: {
            lead_status: lead.status || 'Converted'
          }
        }
      ]
    };

    try {
      const url = `https://graph.facebook.com/v19.0/${pixelId}/events`;
      const response = await axios.post(url, payload, {
        params: { access_token: accessToken }
      });
      console.log('[ConversionService] Meta Conversion API success:', response.data);
    } catch (error) {
      console.error('[ConversionService] Meta Conversion API failed:', error.response?.data || error.message);
    }
  }

  async triggerGoogleConversion(lead) {
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
    const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
    const conversionActionId = process.env.GOOGLE_CONVERSION_ACTION_ID;
    const accessToken = process.env.GOOGLE_ADS_ACCESS_TOKEN; // Normally fetched via OAuth

    if (!customerId || !developerToken || !conversionActionId || !accessToken) {
      console.warn('[ConversionService] Google Ads API keys not fully configured. Skipping Google conversion.');
      return;
    }

    console.log('[ConversionService] Triggering Google Offline Conversion for lead:', lead.id);

    // Google Ads API (REST) format for Click Conversions
    const url = `https://googleads.googleapis.com/v16/customers/${customerId}:uploadClickConversions`;
    
    // We typically use gclid from lead platform_data if available
    const gclid = lead.platform_data?.gclid || 'UNKNOWN_GCLID';
    
    const payload = {
      conversions: [
        {
          gclid,
          conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
          conversionDateTime: new Date().toISOString().replace('T', ' ').substring(0, 19) + (new Date().getTimezoneOffset() > 0 ? '-' : '+') + '00:00', // e.g. "yyyy-mm-dd hh:mm:ss+|-hh:mm"
          conversionValue: 100.0,
          currencyCode: "USD"
        }
      ],
      partialFailure: true
    };

    try {
      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': developerToken,
          'login-customer-id': customerId
        }
      });
      console.log('[ConversionService] Google Conversion API success:', response.data);
    } catch (error) {
      console.error('[ConversionService] Google Conversion API failed:', error.response?.data || error.message);
    }
  }

  hashData(data) {
    if (!data) return undefined;
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}

module.exports = new ConversionService();
