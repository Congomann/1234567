/**
 * NHFG Bank Verification Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Production-ready service layer that proxies all Plaid operations through
 * the NHFG backend API (server.cjs).
 *
 * IMPORTANT:
 *  - The Plaid access_token is NEVER sent to or stored on the frontend.
 *  - All sensitive token operations happen exclusively on the backend.
 *  - The frontend only ever receives masked account data and verification IDs.
 *
 * Flow:
 *  1. createLinkToken()     → backend calls Plaid /link/token/create
 *  2. usePlaidLink()        → user completes Plaid Link widget (Plaid JS SDK)
 *  3. exchangeToken()       → backend exchanges public_token, calls Auth, saves to DB
 *  4. getVerifications()    → backend queries bank_verifications table
 *  5. updateStatus()        → backend PATCH on individual record
 *  6. saveManual()          → backend validates routing # (ABA checksum) + saves
 */

const BASE_URL = '/api';


const getHeaders = (): HeadersInit => {
  const token = localStorage.getItem('nhfg_jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/** Generic fetch wrapper with error extraction */
const apiFetch = async <T>(
  path: string,
  opts: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> => {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...opts,
      headers: { ...getHeaders(), ...(opts.headers || {}) },
    });

    const text = await res.text();

    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const body = JSON.parse(text);
        msg = body.error || body.message || body.hint || msg;
      } catch {
        console.error('[BankVerification] Non-JSON error response:', text.slice(0, 200));
        if (text.includes('Vercel Security Checkpoint')) msg = 'Vercel Security/WAF blocked the request.';
        else msg += ': Vercel returned HTML or text. See console.';
      }
      return { data: null, error: msg };
    }

    try {
      if (!text) return { data: {} as T, error: null };
      const data: T = JSON.parse(text);
      return { data, error: null };
    } catch {
      console.error('[BankVerification] Expected JSON, but Vercel returned HTML:', text.slice(0, 300));
      return { data: null, error: 'API returned HTML instead of JSON. Check Vercel logs or WAF settings.' };
    }
  } catch (err: any) {
    console.error('[BankVerification] Fetch failed entirely:', err);
    return {
      data: null,
      error: 'Backend offline — unable to fetch from server.',
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
   * The link_token is short-lived (~30 min) and used only to open the
   * Plaid Link widget on the client side.
   *
   * Docs: POST /api/plaid/create-link-token
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
   * The backend will:
   *   a) Exchange public_token → access_token (stored in DB, never returned here)
   *   b) Call Plaid Auth to retrieve routing + account numbers
   *   c) Create a bank_verifications record in PostgreSQL
   *   d) Return only safe, masked metadata
   *
   * Docs: POST /api/plaid/exchange-token
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
   * Supports optional search and status filter.
   *
   * Docs: GET /api/plaid/verifications
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
   * Used by internal staff to manually approve, reject, or flag records.
   *
   * Docs: PATCH /api/plaid/verifications/:id
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
   * The backend performs ABA checksum validation on the routing number.
   * Account numbers are NEVER sent or stored — only the last 4 digits (mask).
   * Manual entries start in "micro_deposit" status.
   *
   * Docs: POST /api/plaid/verifications/manual
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
   *
   * Docs: PATCH /api/plaid/verifications/:id/info
   */
  updateInfo: async (
    id: string,
    payload: {
      client_name?: string;
      client_email?: string;
      client_phone?: string;
      institution_name?: string;
      routing_number?: string;
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
   *
   * Docs: DELETE /api/plaid/verifications/:id
   */
  deleteVerification: async (
    id: string
  ): Promise<{ data: any | null; error: string | null }> => {
    return apiFetch<any>(`/plaid/verifications/${id}`, {
      method: 'DELETE',
    });
  },

};
