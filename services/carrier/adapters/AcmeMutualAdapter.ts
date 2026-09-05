import { BaseCarrierAdapter, normalizeDateToYMD } from '../CarrierAdapter.ts';
import type {
  AcmeMutualRawPayload,
  NormalizedPolicyData,
  NormalizedPolicyStatus,
  PaymentFrequency,
  MissedPaymentInfo,
  PolicyDurationInfo
} from '../types.ts';

/**
 * Adapter for Acme Mutual (Legacy Carrier System)
 * 
 * Acme Mutual uses legacy enterprise conventions:
 * - Nested snake_case keys (policy_details, insured_party, billing)
 * - Monetary figures stored as integer cents (modal_premium_cents, face_amount_cents)
 * - Dates formatted as "YYYY/MM/DD"
 * - Status codes: IN_FORCE, GRACE_PERIOD, LAPSED, EXPIRED
 */
export class AcmeMutualAdapter extends BaseCarrierAdapter<AcmeMutualRawPayload> {
  readonly carrierId = 'acme-mutual';
  readonly carrierName = 'Acme Mutual Life';

  /**
   * Validate that the incoming payload conforms to the Acme Mutual legacy contract.
   */
  validatePayload(rawPayload: unknown): rawPayload is AcmeMutualRawPayload {
    if (!rawPayload || typeof rawPayload !== 'object') {
      return false;
    }
    const p = rawPayload as Record<string, any>;
    if (!p.contract_id || typeof p.contract_id !== 'string') {
      return false;
    }
    if (!p.insured_party || typeof p.insured_party !== 'object' || !p.insured_party.full_legal_name || !p.insured_party.dob) {
      return false;
    }
    if (!p.policy_details || typeof p.policy_details !== 'object' || !p.policy_details.policy_status || !p.policy_details.issue_date) {
      return false;
    }
    if (!p.billing || typeof p.billing !== 'object' || typeof p.billing.modal_premium_cents !== 'number') {
      return false;
    }
    if (!p.coverage || typeof p.coverage !== 'object' || typeof p.coverage.face_amount_cents !== 'number') {
      return false;
    }
    return true;
  }

  /**
   * Normalize Acme Mutual legacy payload into the universal NormalizedPolicyData format.
   */
  normalize(rawPayload: AcmeMutualRawPayload, options?: { referenceDate?: Date | string }): NormalizedPolicyData {
    if (!this.validatePayload(rawPayload)) {
      throw new Error(`[AcmeMutualAdapter] Invalid payload schema for contract: ${(rawPayload as any)?.contract_id || 'unknown'}`);
    }

    const refDate = options?.referenceDate ?? new Date();

    // 1. Status Mapping
    const rawStatus = (rawPayload.policy_details.policy_status || '').toUpperCase().trim();
    let status: NormalizedPolicyStatus;
    if (rawStatus === 'IN_FORCE' || rawStatus === 'ACTIVE') {
      status = 'active';
    } else if (rawStatus === 'GRACE_PERIOD' || rawStatus === 'GRACE' || rawStatus === 'PENDING') {
      status = 'inactive';
    } else if (rawStatus === 'LAPSED' || rawStatus === 'EXPIRED' || rawStatus === 'TERMINATED' || rawStatus === 'CANCELLED') {
      status = 'lapsed';
    } else {
      // Fallback based on past due installments
      const pastDue = rawPayload.billing?.past_due_installments || 0;
      status = pastDue > 0 ? 'inactive' : 'active';
    }

    // 2. Birthday & Age
    const clientBirthday = this.normalizeDate(rawPayload.insured_party.dob) || '';
    const clientAge = this.calculateAge(clientBirthday, refDate);

    // 3. Currency Conversion (Cents -> USD Dollars)
    const coverageAmount = Math.max(0, (rawPayload.coverage.face_amount_cents || 0) / 100);
    const premiumAmount = Math.max(0, (rawPayload.billing.modal_premium_cents || 0) / 100);

    // 4. Billing Frequency
    const premiumFrequency: PaymentFrequency = this.parseFrequency(rawPayload.billing.frequency);

    // 5. Dates and Duration
    const effectiveDate = this.normalizeDate(rawPayload.policy_details.issue_date) || '';
    const expirationDate = this.normalizeDate(rawPayload.policy_details.expiry_date);
    
    let termYears = rawPayload.policy_details.term_years;
    if (!termYears && effectiveDate && expirationDate) {
      const eYear = parseInt(effectiveDate.split('-')[0], 10);
      const xYear = parseInt(expirationDate.split('-')[0], 10);
      if (!isNaN(eYear) && !isNaN(xYear) && xYear > eYear) {
        termYears = xYear - eYear;
      }
    }
    const tenureMonths = this.calculateTenure(effectiveDate, refDate);

    let isRenewable = true;
    if (typeof rawPayload.policy_details.renewable_flag === 'boolean') {
      isRenewable = rawPayload.policy_details.renewable_flag;
    } else if (typeof rawPayload.policy_details.renewable_flag === 'string') {
      isRenewable = rawPayload.policy_details.renewable_flag.toLowerCase() !== 'false' && rawPayload.policy_details.renewable_flag !== 'N';
    }

    const duration: PolicyDurationInfo = {
      effectiveDate,
      expirationDate,
      termYears,
      tenureMonths,
      isRenewable
    };

    // 6. Missed Payments Extraction
    const missedCount = Math.max(0, rawPayload.billing.past_due_installments || 0);
    const totalAmountDue = Math.max(0, (rawPayload.billing.past_due_cents || 0) / 100);
    const hasMissedPayment = missedCount > 0 || totalAmountDue > 0;
    const lastMissedDate = this.normalizeDate(rawPayload.billing.last_unpaid_due_date);
    const gracePeriodEndsAt = this.normalizeDate(rawPayload.billing.grace_period_end);

    const missedPayments: MissedPaymentInfo = {
      hasMissedPayment,
      missedCount,
      totalAmountDue,
      lastMissedDate,
      gracePeriodEndsAt
    };

    // 7. Product Type Mapping
    const planCode = rawPayload.policy_details.plan_code || 'STANDARD_LIFE';
    let productType = planCode;
    if (planCode.includes('TERM_20')) {
      productType = 'Term Life (20-Year)';
    } else if (planCode.includes('TERM_30')) {
      productType = 'Term Life (30-Year)';
    } else if (planCode.includes('TERM_10')) {
      productType = 'Term Life (10-Year)';
    } else if (planCode.includes('WHOLE')) {
      productType = 'Whole Life Insurance';
    } else if (planCode.includes('UNIVERSAL')) {
      productType = 'Universal Life Insurance';
    }

    return {
      carrierId: this.carrierId,
      carrierName: this.carrierName,
      policyNumber: rawPayload.contract_id,
      clientName: rawPayload.insured_party.full_legal_name,
      clientEmail: rawPayload.insured_party.contact_email,
      clientBirthday,
      clientAge,
      status,
      rawStatus: rawPayload.policy_details.policy_status,
      coverageAmount,
      premiumAmount,
      premiumFrequency,
      duration,
      missedPayments,
      productType,
      rawPayload: rawPayload as unknown as Record<string, unknown>,
      syncedAt: new Date().toISOString()
    };
  }
}
