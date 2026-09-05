import { BaseCarrierAdapter, normalizeDateToYMD } from '../CarrierAdapter.ts';
import type {
  ApexLifeRawPayload,
  NormalizedPolicyData,
  NormalizedPolicyStatus,
  PaymentFrequency,
  MissedPaymentInfo,
  PolicyDurationInfo
} from '../types.ts';

/**
 * Adapter for ApexLife InsurTech (Modern Carrier System)
 * 
 * ApexLife uses modern cloud API conventions:
 * - Flattened camelCase payload structure
 * - Currency amounts in standard USD decimal floats (e.g., 750000.00, 215.50)
 * - ISO 8601 UTC timestamp strings for dates
 * - Modern status codes: CURRENT, PAYMENT_PENDING, TERMINATED, CANCELLED
 */
export class ApexLifeAdapter extends BaseCarrierAdapter<ApexLifeRawPayload> {
  readonly carrierId = 'apex-life';
  readonly carrierName = 'ApexLife InsurTech';

  /**
   * Validate that the incoming payload conforms to the ApexLife modern InsurTech schema.
   */
  validatePayload(rawPayload: unknown): rawPayload is ApexLifeRawPayload {
    if (!rawPayload || typeof rawPayload !== 'object') {
      return false;
    }
    const p = rawPayload as Record<string, any>;
    if (!p.policyId || typeof p.policyId !== 'string') {
      return false;
    }
    if (!p.customer || typeof p.customer !== 'object' || !p.customer.name || !p.customer.birthDate) {
      return false;
    }
    if (!p.state || typeof p.state !== 'string') {
      return false;
    }
    if (typeof p.benefitAmount !== 'number' || typeof p.periodicRate !== 'number') {
      return false;
    }
    if (!p.inceptionDate) {
      return false;
    }
    return true;
  }

  /**
   * Normalize ApexLife InsurTech payload into the universal NormalizedPolicyData format.
   */
  normalize(rawPayload: ApexLifeRawPayload, options?: { referenceDate?: Date | string }): NormalizedPolicyData {
    if (!this.validatePayload(rawPayload)) {
      throw new Error(`[ApexLifeAdapter] Invalid payload schema for policy: ${(rawPayload as any)?.policyId || 'unknown'}`);
    }

    const refDate = options?.referenceDate ?? new Date();

    // 1. Status Mapping
    const rawStatus = (rawPayload.state || '').toUpperCase().trim();
    let status: NormalizedPolicyStatus;
    if (rawStatus === 'CURRENT' || rawStatus === 'ACTIVE') {
      status = 'active';
    } else if (rawStatus === 'PAYMENT_PENDING' || rawStatus === 'GRACE' || rawStatus === 'SUSPENDED' || rawStatus === 'PENDING') {
      status = 'inactive';
    } else if (rawStatus === 'TERMINATED' || rawStatus === 'CANCELLED' || rawStatus === 'LAPSED' || rawStatus === 'EXPIRED') {
      status = 'lapsed';
    } else {
      // Fallback based on delinquent payments
      const delinquent = rawPayload.delinquentPayments || 0;
      status = delinquent > 0 ? 'inactive' : 'active';
    }

    // 2. Birthday & Age
    const clientBirthday = this.normalizeDate(rawPayload.customer.birthDate) || '';
    const clientAge = this.calculateAge(clientBirthday, refDate);

    // 3. Currency (Direct USD floats)
    const coverageAmount = Math.max(0, rawPayload.benefitAmount || 0);
    const premiumAmount = Math.max(0, rawPayload.periodicRate || 0);

    // 4. Billing Frequency
    const premiumFrequency: PaymentFrequency = this.parseFrequency(rawPayload.billingSchedule);

    // 5. Dates and Duration
    const effectiveDate = this.normalizeDate(rawPayload.inceptionDate) || '';
    const expirationDate = this.normalizeDate(rawPayload.expirationDate);
    
    let termYears = rawPayload.termYears;
    if (!termYears && effectiveDate && expirationDate) {
      const eYear = parseInt(effectiveDate.split('-')[0], 10);
      const xYear = parseInt(expirationDate.split('-')[0], 10);
      if (!isNaN(eYear) && !isNaN(xYear) && xYear > eYear) {
        termYears = xYear - eYear;
      }
    }
    const tenureMonths = this.calculateTenure(effectiveDate, refDate);
    const isRenewable = rawPayload.renewable ?? true;

    const duration: PolicyDurationInfo = {
      effectiveDate,
      expirationDate,
      termYears,
      tenureMonths,
      isRenewable
    };

    // 6. Missed Payments Extraction
    const missedCount = Math.max(0, rawPayload.delinquentPayments || 0);
    const totalAmountDue = Math.max(0, rawPayload.totalPastDue || 0);
    const hasMissedPayment = missedCount > 0 || totalAmountDue > 0;
    const lastMissedDate = this.normalizeDate(rawPayload.lastPaymentFailureDate);
    const gracePeriodEndsAt = this.normalizeDate(rawPayload.gracePeriodEnd);

    const missedPayments: MissedPaymentInfo = {
      hasMissedPayment,
      missedCount,
      totalAmountDue,
      lastMissedDate,
      gracePeriodEndsAt
    };

    // 7. Product Type
    const productType = rawPayload.planType || 'Universal Life Plus';

    return {
      carrierId: this.carrierId,
      carrierName: rawPayload.provider || this.carrierName,
      policyNumber: rawPayload.policyId,
      clientName: rawPayload.customer.name,
      clientEmail: rawPayload.customer.email,
      clientBirthday,
      clientAge,
      status,
      rawStatus: rawPayload.state,
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
