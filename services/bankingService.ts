/**
 * NHFG Bank Verification Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-ready service layer that proxies all Plaid operations through
 * the NHFG backend API (server.cjs).
 *
 * IMPORTANT:
 *  - Now uses the hardened Backend singleton to benefit from automatic
 *    token refresh and consistent production headers.
 */

import { Backend } from './apiBackend';

/** Generic fetch wrapper with error extraction */
const apiFetch = async <T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> => {
  try {
    // Route all banking requests through the hardened Backend requester
    // This resolves the production 401 blockade by ensuring persistent auth.
    const data = await Backend.apiRequest<T>(path, opts, 'bank_verifications');
    return { data, error: null };
  } catch (err: any) {
    console.error('[BankVerification] Request failed:', err);
    return {
      data: null,
      error: err.message || 'Backend offline — unable to fetch from server.',
    };
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

export interface VerificationRecord {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  institution_name: string;
  account_name?: string;
  account_mask: string;
  account_type: 'checking' | 'savings' | 'credit' | 'other';
  routing_number?: string;      // Partially masked e.g. "****0021" — never full
  plaid_account_id?: string;
  status: 'pending' | 'verified' | 'failed' | 'micro_deposit';
  verification_method: 'plaid' | 'manual';
  name_match: boolean;
  account_active: boolean;
  draft_risk: 'low' | 'medium' | 'high';
  verified_at?: string;
  verified_by?: string;
  notes?: string;
  created_at: string;
}

export interface LinkTokenResponse {
  link_token: string;
  expiration: string;
}

export interface ExchangeTokenPayload {
  publicToken: string;
  institutionId?: string;
  institutionName?: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  accountId?: string; // Plaid account_id from onSuccess metadata
}

export interface ExchangeTokenResponse {
  success: boolean;
  verificationId: string;
  accountMask: string;
  accountType: string;
  institutionName: string;
  routingNumber: string | null;   // Partially masked
  nameMatch: boolean;
  accountActive: boolean;
  draftRisk: 'low' | 'medium' | 'high';
  status: 'verified';
}

export interface ManualVerificationPayload {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  institutionName: string;
  accountMask: string;         // Last 4 digits only — NEVER the full account number
  accountType: 'checking' | 'savings';
  routingNumber: string;
  notes?: string;
}

export const BankVerificationService = {

  /**
   * Step 1 — Get a Plaid Link Token from the backend.
   */
  createLinkToken: async (
    clientName: string,
    userId?: string
  ): Promise<{ data: LinkTokenResponse | null; error: string | null }> => {
    return apiFetch<LinkTokenResponse>('/plaid/create-link-token', {
      method: 'POST',
      body: JSON.stringify({ clientName, userId }),
    });
  },

  /**
   * Step 3 — Exchange the public_token returned by Plaid Link.
   */
  exchangeToken: async (
    payload: ExchangeTokenPayload
  ): Promise<{ data: ExchangeTokenResponse | null; error: string | null }> => {
    return apiFetch<ExchangeTokenResponse>('/plaid/exchange-token', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Fetch all verification records from the database.
   */
  getVerifications: async (
    search?: string,
    status?: string
  ): Promise<{ data: VerificationRecord[] | null; error: string | null }> => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status && status !== 'all') params.set('status', status);
    const qs = params.toString() ? `?${params}` : '';
    return apiFetch<VerificationRecord[]>(`/plaid/verifications${qs}`);
  },

  /**
   * Update a verification record's status.
   */
  updateStatus: async (
    id: string,
    status: VerificationRecord['status'],
    notes?: string
  ): Promise<{ data: VerificationRecord | null; error: string | null }> => {
    return apiFetch<VerificationRecord>(`/plaid/verifications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
  },

  /**
   * Save a manual ACH verification entry.
   */
  saveManual: async (
    payload: ManualVerificationPayload
  ): Promise<{ data: VerificationRecord | null; error: string | null }> => {
    return apiFetch<VerificationRecord>('/plaid/verifications/manual', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Update client info for a verification record.
   */
  updateInfo: async (
    id: string,
    payload: {
      client_name?: string;
      client_email?: string;
      client_phone?: string;
      institution_name?: string;
      routing_number?: string;
      account_mask?: string;
      notes?: string;
    }
  ): Promise<{ data: VerificationRecord | null; error: string | null }> => {
    return apiFetch<VerificationRecord>(`/plaid/verifications/${id}/info`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Delete a verification record.
   */
  deleteVerification: async (
    id: string
  ): Promise<{ data: any | null; error: string | null }> => {
    return apiFetch<any>(`/plaid/verifications/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Create a Sandbox Public Token for quick 1-click test verifications.
   */
  createSandboxPublicToken: async (
    institutionId?: string
  ): Promise<{ data: { public_token: string } | null; error: string | null }> => {
    return apiFetch<{ public_token: string }>('/plaid/create-sandbox-public-token', {
      method: 'POST',
      body: JSON.stringify({ institutionId: institutionId || 'ins_1' }),
    });
  },
};
