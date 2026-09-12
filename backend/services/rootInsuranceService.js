const { RootApiClientManager } = require('./root-api/authHelper.js');
const { QuotingApi, PrefillApi, PolicyApi } = require('./root-api/dist/index.js');

class RootInsuranceService {
  constructor() {
    this.authManager = new RootApiClientManager();
  }

  /**
   * Initialize API Client with Agent Attribution
   */
  async getClient(agentEmail) {
    if (!this.authManager.jwtToken) {
      await this.authManager.initialize({ agentEmail });
    }
    return this.authManager.apiClient;
  }

  /**
   * Step 1: Create Empty Quote
   */
  async createQuote(agentEmail) {
    const apiClient = await this.getClient(agentEmail);
    const quotingApi = new QuotingApi(apiClient);
    // POST /v3/quoting/quote
    return await quotingApi.createQuote();
  }

  /**
   * Step 2: Create Prefill Request
   * Requires customer consent timestamp
   */
  async createPrefillRequest(agentEmail, quoteId, prefillRequestData) {
    const apiClient = await this.getClient(agentEmail);
    const prefillApi = new PrefillApi(apiClient);
    return await prefillApi.createPrefill(quoteId, {
      prefillRequestParameters: prefillRequestData 
    });
  }

  /**
   * Step 3: Get Prefill Report (Poll until ready)
   */
  async getPrefillReport(agentEmail, quoteId, maxRetries = 10) {
    const apiClient = await this.getClient(agentEmail);
    const prefillApi = new PrefillApi(apiClient);
    
    let attempts = 0;
    while (attempts < maxRetries) {
      try {
        const response = await prefillApi.getPrefillWithHttpInfo(quoteId);
        // 200 means ready, 204 means processing
        if (response.status === 200) {
          return response.data;
        } else if (response.status === 204) {
          // processing, wait and poll again
          await new Promise(res => setTimeout(res, 3000));
          attempts++;
        }
      } catch (err) {
        throw err;
      }
    }
    throw new Error("Prefill report polling timed out.");
  }

  /**
   * Step 4: Update Quote
   */
  async updateQuote(agentEmail, quoteId, updateData) {
    const apiClient = await this.getClient(agentEmail);
    const quotingApi = new QuotingApi(apiClient);
    return await quotingApi.updateQuote(quoteId, {
      quotePatchParameters: updateData
    });
  }

  /**
   * Validate Address
   */
  async validateAddress(agentEmail, quoteId, addressData) {
    const apiClient = await this.getClient(agentEmail);
    const quotingApi = new QuotingApi(apiClient);
    return await quotingApi.validateAddress(quoteId, {
      addressParameters: addressData
    });
  }

  /**
   * Get Available Coverages
   */
  async getAvailableCoverages(agentEmail, quoteId) {
    const apiClient = await this.getClient(agentEmail);
    const quotingApi = new QuotingApi(apiClient);
    return await quotingApi.getAvailableCoveragesByQuoteId(quoteId);
  }

  /**
   * Finalize Quote
   */
  async finalizeQuote(agentEmail, quoteId, paymentMethodId) {
    const apiClient = await this.getClient(agentEmail);
    const quotingApi = new QuotingApi(apiClient);
    return await quotingApi.postFinalizeQuote(quoteId, {
      // payload for finalize
    });
  }

  /**
   * Bind Policy
   */
  async bindPolicy(agentEmail, quoteId) {
    const apiClient = await this.getClient(agentEmail);
    const quotingApi = new QuotingApi(apiClient);
    return await quotingApi.postBindQuote(quoteId);
  }
}

module.exports = new RootInsuranceService();
