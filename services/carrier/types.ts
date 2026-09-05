/**
 * Universal Carrier API Framework Type Definitions
 * 
 * Standardized data models for cross-carrier policy synchronization,
 * billing, missed payment tracking, and lifecycle status normalization.
 */

export type NormalizedPolicyStatus = 'active' | 'inactive' | 'lapsed';

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

export interface MissedPaymentInfo {
  hasMissedPayment: boolean;
  missedCount: number;
  totalAmountDue: number; // In USD ($)
  lastMissedDate?: string; // ISO YYYY-MM-DD
  gracePeriodEndsAt?: string; // ISO YYYY-MM-DD
}

export interface PolicyDurationInfo {
  effectiveDate: string; // ISO YYYY-MM-DD
  expirationDate?: string; // ISO YYYY-MM-DD
  termYears?: number; // E.g., 10, 20, 30
  tenureMonths: number; // Months active from effective date to reference date
  isRenewable: boolean;
}

export interface NormalizedPolicyData {
  carrierId: string;
  carrierName: string;
  policyNumber: string;
  clientId?: string;
  clientName: string;
  clientEmail?: string;
  clientBirthday: string; // ISO YYYY-MM-DD
  clientAge: number; // Calculated age in years
  status: NormalizedPolicyStatus;
  rawStatus: string;
  coverageAmount: number; // In USD ($)
  premiumAmount: number; // In USD ($)
  premiumFrequency: PaymentFrequency;
  duration: PolicyDurationInfo;
  missedPayments: MissedPaymentInfo;
  productType: string;
  rawPayload?: Record<string, unknown>;
  syncedAt: string; // ISO 8601 UTC timestamp
}

export interface CarrierMetadata {
  carrierId: string;
  carrierName: string;
  category?: string;
  description?: string;
  isMock?: boolean;
}

/**
 * Raw payload types for Acme Mutual (Legacy Carrier Schema)
 */
export interface AcmeMutualRawPayload {
  carrier_code?: string;
  contract_id: string;
  insured_party: {
    full_legal_name: string;
    dob: string; // Formats: "YYYY/MM/DD" or "YYYY-MM-DD"
    contact_email?: string;
    ssn_last4?: string;
  };
  policy_details: {
    plan_code: string;
    policy_status: string; // E.g., "IN_FORCE", "GRACE_PERIOD", "LAPSED", "EXPIRED"
    issue_date: string; // "YYYY/MM/DD"
    expiry_date?: string; // "YYYY/MM/DD"
    term_years?: number;
    renewable_flag?: boolean | string;
  };
  coverage: {
    face_amount_cents: number;
    cash_value_cents?: number;
  };
  billing: {
    modal_premium_cents: number;
    frequency: string; // E.g., "MONTHLY", "ANNUAL"
    past_due_installments?: number;
    past_due_cents?: number;
    last_unpaid_due_date?: string;
    grace_period_end?: string;
  };
}

/**
 * Raw payload types for Apex Life (Modern InsurTech Schema)
 */
export interface ApexLifeRawPayload {
  provider?: string;
  policyId: string;
  customer: {
    name: string;
    birthDate: string; // ISO timestamp or YYYY-MM-DD
    email?: string;
    phone?: string;
  };
  state: string; // E.g., "CURRENT", "ACTIVE", "PAYMENT_PENDING", "TERMINATED", "CANCELLED"
  planType: string;
  benefitAmount: number; // In USD float ($)
  periodicRate: number; // In USD float ($)
  billingSchedule: string; // "monthly", "quarterly", "semi-annual", "annual"
  inceptionDate: string; // ISO timestamp
  expirationDate?: string; // ISO timestamp
  termYears?: number;
  renewable?: boolean;
  delinquentPayments?: number;
  totalPastDue?: number; // In USD float ($)
  lastPaymentFailureDate?: string; // ISO timestamp
  gracePeriodEnd?: string; // ISO timestamp
}
