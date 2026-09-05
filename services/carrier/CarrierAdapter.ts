import type {
  NormalizedPolicyData,
  PaymentFrequency,
  MissedPaymentInfo,
  PolicyDurationInfo
} from './types.ts';

/**
 * Universal Carrier Adapter Interface
 * 
 * Every insurance carrier integration must implement this contract, providing
 * payload validation, age calculation, and conversion from the carrier's
 * proprietary schema into NormalizedPolicyData.
 */
export interface CarrierAdapter<TRawPayload = unknown> {
  readonly carrierId: string;
  readonly carrierName: string;

  /**
   * Validate that the incoming raw payload satisfies the carrier's required shape.
   */
  validatePayload(rawPayload: unknown): rawPayload is TRawPayload;

  /**
   * Normalize the carrier-specific raw payload into the universal CRM policy structure.
   */
  normalize(rawPayload: TRawPayload, options?: { referenceDate?: Date | string }): NormalizedPolicyData;

  /**
   * Calculate client age in years from ISO birthday.
   */
  calculateAge(birthdayIso: string, referenceDate?: Date | string): number;
}

/**
 * Standard utility: Convert various date representations into YYYY-MM-DD.
 * Handles 'YYYY/MM/DD', 'YYYY-MM-DD', and ISO 8601 timestamps.
 */
export function normalizeDateToYMD(dateInput: string | Date | undefined | null): string | undefined {
  if (!dateInput) return undefined;
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // Check YYYY/MM/DD format
    if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(trimmed)) {
      const parts = trimmed.split('/');
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const d = parts[2].padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Check standard ISO or date string
    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return trimmed;
  }
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput.toISOString().split('T')[0];
  }
  return undefined;
}

/**
 * Standard utility: Calculate exact age in completed years.
 */
export function calculateAge(birthdayIso: string, referenceDate: Date | string = new Date()): number {
  if (!birthdayIso) return 0;
  const ymd = normalizeDateToYMD(birthdayIso);
  if (!ymd) return 0;

  const [bYear, bMonth, bDay] = ymd.split('-').map(Number);
  if (!bYear || !bMonth || !bDay) return 0;

  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  if (isNaN(ref.getTime())) return 0;

  let age = ref.getFullYear() - bYear;
  const currentMonth = ref.getMonth() + 1; // 1-12
  const currentDay = ref.getDate();

  if (currentMonth < bMonth || (currentMonth === bMonth && currentDay < bDay)) {
    age--;
  }

  return Math.max(0, age);
}

/**
 * Standard utility: Calculate active policy tenure in months.
 */
export function calculateTenureMonths(effectiveDateIso: string, referenceDate: Date | string = new Date()): number {
  if (!effectiveDateIso) return 0;
  const ymd = normalizeDateToYMD(effectiveDateIso);
  if (!ymd) return 0;

  const [eYear, eMonth, eDay] = ymd.split('-').map(Number);
  if (!eYear || !eMonth) return 0;

  const ref = referenceDate instanceof Date ? referenceDate : new Date(referenceDate);
  if (isNaN(ref.getTime())) return 0;

  const refYear = ref.getFullYear();
  const refMonth = ref.getMonth() + 1;
  const refDay = ref.getDate();

  let months = (refYear - eYear) * 12 + (refMonth - eMonth);
  if (refDay < (eDay || 1)) {
    months--;
  }

  return Math.max(0, months);
}

/**
 * Standard utility: Normalize billing frequencies.
 */
export function normalizeFrequency(freq: string | undefined | null): PaymentFrequency {
  if (!freq) return 'monthly';
  const clean = freq.toLowerCase().trim().replace(/[-_]/g, '');
  if (clean.includes('annual') || clean === 'yearly') {
    if (clean.includes('semi')) return 'semi-annual';
    return 'annual';
  }
  if (clean.includes('quarter')) return 'quarterly';
  if (clean.includes('semi')) return 'semi-annual';
  return 'monthly';
}

/**
 * Base Carrier Adapter with shared helper functionality.
 */
export abstract class BaseCarrierAdapter<TRawPayload> implements CarrierAdapter<TRawPayload> {
  abstract readonly carrierId: string;
  abstract readonly carrierName: string;

  abstract validatePayload(rawPayload: unknown): rawPayload is TRawPayload;
  abstract normalize(rawPayload: TRawPayload, options?: { referenceDate?: Date | string }): NormalizedPolicyData;

  calculateAge(birthdayIso: string, referenceDate?: Date | string): number {
    return calculateAge(birthdayIso, referenceDate);
  }

  protected normalizeDate(dateInput: string | Date | undefined | null): string | undefined {
    return normalizeDateToYMD(dateInput);
  }

  protected calculateTenure(effectiveDateIso: string, referenceDate?: Date | string): number {
    return calculateTenureMonths(effectiveDateIso, referenceDate);
  }

  protected parseFrequency(freq: string | undefined | null): PaymentFrequency {
    return normalizeFrequency(freq);
  }
}
