const { ApiClient, AuthApi } = require('./dist/index.js');

class RootApiClientManager {
  constructor(environment = 'app.partner-testing.joinroot.com') {
    this.apiClient = new ApiClient();
    this.apiClient.basePath = `https://${environment}/bind_api`;
    
    // Will be populated after token creation
    this.jwtToken = null;
    
    // We expect the user to set ROOT_INTEGRATION_SECRET_KEY in their .env
    const secretKey = process.env.ROOT_INTEGRATION_SECRET_KEY;
    if (secretKey) {
      // The swagger defines security: - integration_secret_key: []
      // Let's set it in the ApiClient default authentications
      // Usually it's ApiKeyAuth or similar. Let's just set the default header for the initial token call if needed.
      this.apiClient.authentications['integration_secret_key'] = {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        apiKey: `Bearer ${secretKey}` // or just the secret key depending on Root's scheme. Root usually expects Bearer.
      };
    }
  }

  /**
   * Initializes the client by fetching a JWT token
   * @param {Object} params 
   * @param {string} [params.agentEmail] - Use for agentx or embedded with agent attribution
   * @param {string} [params.tokenReference] - Use for hostedx or embedded without agent attribution
   */
  async initialize({ agentEmail, tokenReference }) {
    if (!process.env.ROOT_INTEGRATION_SECRET_KEY) {
      throw new Error("ROOT_INTEGRATION_SECRET_KEY environment variable is not set. Please store your Integration Secret Key in a protected manner in .env");
    }

    const authApi = new AuthApi(this.apiClient);
    
    const requestBody = {};
    if (agentEmail) {
      requestBody.agentEmail = agentEmail;
    } else if (tokenReference) {
      requestBody.tokenReference = tokenReference;
    } else {
      throw new Error("Either agentEmail or tokenReference must be provided for Root Authentication.");
    }

    try {
      // POSTs to create a new JWT auth token
      const response = await authApi.createToken({ authTokenParameters: requestBody });
      
      // The response should have the token in response.token or response.data.token
      // We need to guard against multiple token responses in ambiguous token creations
      // If the response returns an array of tokens (ambiguous), we must throw or handle it
      if (Array.isArray(response) && response.length > 1) {
        throw new Error("Ambiguous token creation: multiple token responses received. Please refine the token parameters.");
      }
      
      const tokenObj = Array.isArray(response) ? response[0] : response;
      const jwtToken = tokenObj.bearerToken; // Update the API client default authentication
      this.apiClient.authentications['root_jwt'] = {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        apiKey: `Bearer ${jwtToken}`
      }; // adjust field based on actual response schema
      
      this.jwtToken = jwtToken;
      
      // Use the token for all subsequent API client interactions
      // The Swagger typically defines `jwt` or `bearerAuth` for the main API endpoints
      this.apiClient.authentications['jwt'] = {
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
        apiKey: `Bearer ${jwtToken}`
      };
      
      return this.apiClient;
    } catch (err) {
      console.error("Failed to initialize Root API client token", err.message || err);
      throw err;
    }
  }
}

module.exports = { RootApiClientManager };
