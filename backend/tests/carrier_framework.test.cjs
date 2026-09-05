const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

// Import the carrier framework via Node's native module loader
const {
  CarrierRegistry,
  carrierRegistry,
  AcmeMutualAdapter,
  ApexLifeAdapter
} = require('../../services/carrier/CarrierRegistry.ts');

const {
  calculateAge,
  calculateTenureMonths,
  normalizeDateToYMD,
  normalizeFrequency
} = require('../../services/carrier/CarrierAdapter.ts');

// Reference fixed test date for deterministic assertions: 2026-09-03
const TEST_REF_DATE = new Date('2026-09-03T12:00:00.000Z');

describe('Milestone M2: Modular Carrier API Framework Suite', () => {

  describe('1. Date, Age, and Frequency Utilities', () => {
    test('normalizeDateToYMD handles various formats', () => {
      assert.equal(normalizeDateToYMD('1982/06/14'), '1982-06-14');
      assert.equal(normalizeDateToYMD('1991-03-29T00:00:00.000Z'), '1991-03-29');
      assert.equal(normalizeDateToYMD('2022-01-15'), '2022-01-15');
      assert.equal(normalizeDateToYMD(undefined), undefined);
      assert.equal(normalizeDateToYMD(''), undefined);
    });

    test('calculateAge calculates correct age based on birthday and reference date', () => {
      // Born June 14, 1982 -> on Sept 3, 2026 = 44 years
      assert.equal(calculateAge('1982-06-14', TEST_REF_DATE), 44);
      // Born Nov 20, 1982 -> on Sept 3, 2026 = 43 years (birthday hasn't occurred yet)
      assert.equal(calculateAge('1982-11-20', TEST_REF_DATE), 43);
      // Born Sept 3, 2000 -> on Sept 3, 2026 = 26 years (exact birthday)
      assert.equal(calculateAge('2000-09-03', TEST_REF_DATE), 26);
      // Leap year birthday: Feb 29, 2000 -> on Sept 3, 2026 = 26 years
      assert.equal(calculateAge('2000-02-29', TEST_REF_DATE), 26);
      // Invalid input returns 0 without crashing
      assert.equal(calculateAge('', TEST_REF_DATE), 0);
      assert.equal(calculateAge('invalid-date', TEST_REF_DATE), 0);
    });

    test('calculateTenureMonths computes active months correctly', () => {
      // Effective June 1, 2020 to Sept 3, 2026 = 6 years + 3 months = 75 months
      assert.equal(calculateTenureMonths('2020-06-01', TEST_REF_DATE), 75);
      // Effective Jan 15, 2022 to Sept 3, 2026 = 55 months (Sept 3 is before 15th, so 55)
      assert.equal(calculateTenureMonths('2022-01-15', TEST_REF_DATE), 55);
      // Future date returns 0
      assert.equal(calculateTenureMonths('2030-01-01', TEST_REF_DATE), 0);
    });

    test('normalizeFrequency standardizes frequency variants', () => {
      assert.equal(normalizeFrequency('MONTHLY'), 'monthly');
      assert.equal(normalizeFrequency('quarterly'), 'quarterly');
      assert.equal(normalizeFrequency('SEMI_ANNUAL'), 'semi-annual');
      assert.equal(normalizeFrequency('annual'), 'annual');
      assert.equal(normalizeFrequency('Yearly'), 'annual');
      assert.equal(normalizeFrequency(null), 'monthly');
    });
  });

  describe('2. AcmeMutualAdapter (Legacy Carrier Normalization)', () => {
    const adapter = new AcmeMutualAdapter();

    test('normalizes active legacy payload (IN_FORCE, cents to dollars, YYYY/MM/DD)', () => {
      const rawPayload = {
        carrier_code: 'ACME_MUTUAL',
        contract_id: 'ACM-88921-X',
        insured_party: {
          full_legal_name: 'Eleanor Vance',
          dob: '1982/06/14',
          contact_email: 'eleanor.vance@example.com'
        },
        policy_details: {
          plan_code: 'TERM_20_PREMIUM',
          policy_status: 'IN_FORCE',
          issue_date: '2020/06/01',
          expiry_date: '2040/06/01',
          term_years: 20,
          renewable_flag: true
        },
        coverage: {
          face_amount_cents: 50000000
        },
        billing: {
          modal_premium_cents: 14500,
          frequency: 'MONTHLY',
          past_due_installments: 0,
          past_due_cents: 0
        }
      };

      const normalized = adapter.normalize(rawPayload, { referenceDate: TEST_REF_DATE });

      assert.equal(normalized.carrierId, 'acme-mutual');
      assert.equal(normalized.carrierName, 'Acme Mutual Life');
      assert.equal(normalized.policyNumber, 'ACM-88921-X');
      assert.equal(normalized.clientName, 'Eleanor Vance');
      assert.equal(normalized.clientEmail, 'eleanor.vance@example.com');
      assert.equal(normalized.clientBirthday, '1982-06-14');
      assert.equal(normalized.clientAge, 44);
      assert.equal(normalized.status, 'active');
      assert.equal(normalized.rawStatus, 'IN_FORCE');
      assert.equal(normalized.coverageAmount, 500000.00);
      assert.equal(normalized.premiumAmount, 145.00);
      assert.equal(normalized.premiumFrequency, 'monthly');

      // Duration verification
      assert.equal(normalized.duration.effectiveDate, '2020-06-01');
      assert.equal(normalized.duration.expirationDate, '2040-06-01');
      assert.equal(normalized.duration.termYears, 20);
      assert.equal(normalized.duration.tenureMonths, 75);
      assert.equal(normalized.duration.isRenewable, true);

      // Missed payments verification
      assert.equal(normalized.missedPayments.hasMissedPayment, false);
      assert.equal(normalized.missedPayments.missedCount, 0);
      assert.equal(normalized.missedPayments.totalAmountDue, 0.00);

      // Product and sync
      assert.equal(normalized.productType, 'Term Life (20-Year)');
      assert.ok(normalized.syncedAt);
    });

    test('normalizes delinquent Acme Mutual payload with GRACE_PERIOD status and past due installments', () => {
      const rawPayload = {
        carrier_code: 'ACME_MUTUAL',
        contract_id: 'ACM-99342-Y',
        insured_party: {
          full_legal_name: 'Arthur Pendelton',
          dob: '1975/11/04',
          contact_email: 'arthur.p@example.com'
        },
        policy_details: {
          plan_code: 'WHOLE_LIFE_ESTATE',
          policy_status: 'GRACE_PERIOD',
          issue_date: '2015/03/01',
          term_years: 0
        },
        coverage: {
          face_amount_cents: 25000000
        },
        billing: {
          modal_premium_cents: 32000,
          frequency: 'MONTHLY',
          past_due_installments: 1,
          past_due_cents: 32000,
          last_unpaid_due_date: '2026/08/01',
          grace_period_end: '2026/09/30'
        }
      };

      const normalized = adapter.normalize(rawPayload, { referenceDate: TEST_REF_DATE });

      assert.equal(normalized.status, 'inactive');
      assert.equal(normalized.rawStatus, 'GRACE_PERIOD');
      assert.equal(normalized.coverageAmount, 250000.00);
      assert.equal(normalized.premiumAmount, 320.00);
      assert.equal(normalized.missedPayments.hasMissedPayment, true);
      assert.equal(normalized.missedPayments.missedCount, 1);
      assert.equal(normalized.missedPayments.totalAmountDue, 320.00);
      assert.equal(normalized.missedPayments.lastMissedDate, '2026-08-01');
      assert.equal(normalized.missedPayments.gracePeriodEndsAt, '2026-09-30');
      assert.equal(normalized.productType, 'Whole Life Insurance');
    });

    test('normalizes LAPSED status into status "lapsed"', () => {
      const rawPayload = {
        contract_id: 'ACM-11002-Z',
        insured_party: {
          full_legal_name: 'Sarah Connor',
          dob: '1984/02/28'
        },
        policy_details: {
          plan_code: 'TERM_10_BASIC',
          policy_status: 'LAPSED',
          issue_date: '2012/01/01',
          expiry_date: '2022/01/01'
        },
        coverage: {
          face_amount_cents: 10000000
        },
        billing: {
          modal_premium_cents: 8000,
          frequency: 'ANNUAL',
          past_due_installments: 3,
          past_due_cents: 24000
        }
      };

      const normalized = adapter.normalize(rawPayload, { referenceDate: TEST_REF_DATE });
      assert.equal(normalized.status, 'lapsed');
      assert.equal(normalized.rawStatus, 'LAPSED');
      assert.equal(normalized.missedPayments.hasMissedPayment, true);
      assert.equal(normalized.missedPayments.missedCount, 3);
      assert.equal(normalized.missedPayments.totalAmountDue, 240.00);
    });

    test('validates payload schema and rejects malformed inputs', () => {
      assert.equal(adapter.validatePayload(null), false);
      assert.equal(adapter.validatePayload({}), false);
      assert.equal(adapter.validatePayload({ contract_id: '123' }), false);

      // Throws on normalize if invalid
      assert.throws(() => {
        adapter.normalize({ contract_id: '123' });
      }, /Invalid payload schema/);
    });
  });

  describe('3. ApexLifeAdapter (Modern InsurTech Normalization)', () => {
    const adapter = new ApexLifeAdapter();

    test('normalizes active InsurTech payload with decimal floats and ISO timestamps', () => {
      const rawPayload = {
        provider: 'ApexLife InsurTech',
        policyId: 'APX-2024-9912',
        customer: {
          name: 'Marcus Holloway',
          birthDate: '1991-03-29T00:00:00.000Z',
          email: 'marcus.holloway@example.com',
          phone: '+15552345678'
        },
        state: 'CURRENT',
        planType: 'Universal Life Plus',
        benefitAmount: 750000.00,
        periodicRate: 215.50,
        billingSchedule: 'monthly',
        inceptionDate: '2022-01-15T00:00:00.000Z',
        expirationDate: '2052-01-15T00:00:00.000Z',
        termYears: 30,
        renewable: true,
        delinquentPayments: 0,
        totalPastDue: 0.00
      };

      const normalized = adapter.normalize(rawPayload, { referenceDate: TEST_REF_DATE });

      assert.equal(normalized.carrierId, 'apex-life');
      assert.equal(normalized.carrierName, 'ApexLife InsurTech');
      assert.equal(normalized.policyNumber, 'APX-2024-9912');
      assert.equal(normalized.clientName, 'Marcus Holloway');
      assert.equal(normalized.clientEmail, 'marcus.holloway@example.com');
      assert.equal(normalized.clientBirthday, '1991-03-29');
      assert.equal(normalized.clientAge, 35);
      assert.equal(normalized.status, 'active');
      assert.equal(normalized.rawStatus, 'CURRENT');
      assert.equal(normalized.coverageAmount, 750000.00);
      assert.equal(normalized.premiumAmount, 215.50);
      assert.equal(normalized.premiumFrequency, 'monthly');

      // Duration
      assert.equal(normalized.duration.effectiveDate, '2022-01-15');
      assert.equal(normalized.duration.expirationDate, '2052-01-15');
      assert.equal(normalized.duration.termYears, 30);
      assert.equal(normalized.duration.tenureMonths, 55);
      assert.equal(normalized.duration.isRenewable, true);

      // Missed payments
      assert.equal(normalized.missedPayments.hasMissedPayment, false);
      assert.equal(normalized.missedPayments.missedCount, 0);
      assert.equal(normalized.missedPayments.totalAmountDue, 0.00);

      assert.equal(normalized.productType, 'Universal Life Plus');
    });

    test('normalizes PAYMENT_PENDING status with delinquent payments and failure timestamps', () => {
      const rawPayload = {
        provider: 'ApexLife InsurTech',
        policyId: 'APX-2024-8841',
        customer: {
          name: 'Rachel Chen',
          birthDate: '1988-07-22T00:00:00.000Z',
          email: 'rachel.chen@example.com'
        },
        state: 'PAYMENT_PENDING',
        planType: 'Variable Life Select',
        benefitAmount: 600000.00,
        periodicRate: 180.00,
        billingSchedule: 'monthly',
        inceptionDate: '2023-05-01T00:00:00.000Z',
        delinquentPayments: 2,
        totalPastDue: 360.00,
        lastPaymentFailureDate: '2026-08-15T00:00:00.000Z',
        gracePeriodEnd: '2026-09-15T00:00:00.000Z'
      };

      const normalized = adapter.normalize(rawPayload, { referenceDate: TEST_REF_DATE });

      assert.equal(normalized.status, 'inactive');
      assert.equal(normalized.rawStatus, 'PAYMENT_PENDING');
      assert.equal(normalized.missedPayments.hasMissedPayment, true);
      assert.equal(normalized.missedPayments.missedCount, 2);
      assert.equal(normalized.missedPayments.totalAmountDue, 360.00);
      assert.equal(normalized.missedPayments.lastMissedDate, '2026-08-15');
      assert.equal(normalized.missedPayments.gracePeriodEndsAt, '2026-09-15');
    });

    test('normalizes TERMINATED and CANCELLED statuses to "lapsed"', () => {
      const rawPayload = {
        policyId: 'APX-2021-0012',
        customer: {
          name: 'David Webb',
          birthDate: '1970-12-05'
        },
        state: 'TERMINATED',
        planType: 'Term 10',
        benefitAmount: 500000.00,
        periodicRate: 95.00,
        billingSchedule: 'annual',
        inceptionDate: '2021-01-01'
      };

      const normalized = adapter.normalize(rawPayload, { referenceDate: TEST_REF_DATE });
      assert.equal(normalized.status, 'lapsed');
      assert.equal(normalized.rawStatus, 'TERMINATED');
    });

    test('validates payload and rejects malformed inputs', () => {
      assert.equal(adapter.validatePayload(null), false);
      assert.equal(adapter.validatePayload({ policyId: '123' }), false);
      assert.equal(adapter.validatePayload({ policyId: '123', customer: {} }), false);

      assert.throws(() => {
        adapter.normalize({ policyId: '123' });
      }, /Invalid payload schema/);
    });
  });

  describe('4. CarrierRegistry Integration & Dispatch', () => {
    test('default registry instance has pre-registered AcmeMutual and ApexLife adapters', () => {
      const supported = carrierRegistry.listSupported();
      assert.equal(supported.length, 2);

      const carrierIds = supported.map(c => c.carrierId);
      assert.ok(carrierIds.includes('acme-mutual'));
      assert.ok(carrierIds.includes('apex-life'));
    });

    test('lookup resolves case-insensitive IDs and aliases', () => {
      // Canonical ID
      assert.ok(carrierRegistry.get('acme-mutual') instanceof AcmeMutualAdapter);
      assert.ok(carrierRegistry.get('apex-life') instanceof ApexLifeAdapter);

      // Hyphen/underscore and case variations
      assert.ok(carrierRegistry.get('acme_mutual') instanceof AcmeMutualAdapter);
      assert.ok(carrierRegistry.get('ACME_MUTUAL') instanceof AcmeMutualAdapter);
      assert.ok(carrierRegistry.get('Acme Mutual') instanceof AcmeMutualAdapter);
      assert.ok(carrierRegistry.get('apex_life') instanceof ApexLifeAdapter);
      assert.ok(carrierRegistry.get('APEX_LIFE') instanceof ApexLifeAdapter);
      assert.ok(carrierRegistry.get('ApexLife') instanceof ApexLifeAdapter);

      // Non-existent carrier returns undefined
      assert.equal(carrierRegistry.get('unknown-carrier'), undefined);
      assert.equal(carrierRegistry.has('unknown-carrier'), false);
    });

    test('dispatches normalize() correctly for both carriers through the registry', () => {
      // 1. Acme Mutual payload dispatch
      const acmePayload = {
        contract_id: 'ACM-REG-01',
        insured_party: {
          full_legal_name: 'Registry Test User 1',
          dob: '1995/04/10'
        },
        policy_details: {
          plan_code: 'TERM_20',
          policy_status: 'IN_FORCE',
          issue_date: '2023/04/10'
        },
        coverage: {
          face_amount_cents: 30000000
        },
        billing: {
          modal_premium_cents: 9500,
          frequency: 'MONTHLY'
        }
      };

      const acmeResult = carrierRegistry.normalize('ACME_MUTUAL', acmePayload, { referenceDate: TEST_REF_DATE });
      assert.equal(acmeResult.carrierId, 'acme-mutual');
      assert.equal(acmeResult.policyNumber, 'ACM-REG-01');
      assert.equal(acmeResult.status, 'active');
      assert.equal(acmeResult.coverageAmount, 300000.00);
      assert.equal(acmeResult.premiumAmount, 95.00);
      assert.equal(acmeResult.clientBirthday, '1995-04-10');
      assert.equal(acmeResult.clientAge, 31);

      // 2. Apex Life payload dispatch
      const apexPayload = {
        policyId: 'APX-REG-02',
        customer: {
          name: 'Registry Test User 2',
          birthDate: '1985-10-15T00:00:00.000Z'
        },
        state: 'CURRENT',
        planType: 'Universal Life',
        benefitAmount: 450000.00,
        periodicRate: 155.25,
        billingSchedule: 'monthly',
        inceptionDate: '2021-06-01T00:00:00.000Z'
      };

      const apexResult = carrierRegistry.normalize('apex-life', apexPayload, { referenceDate: TEST_REF_DATE });
      assert.equal(apexResult.carrierId, 'apex-life');
      assert.equal(apexResult.policyNumber, 'APX-REG-02');
      assert.equal(apexResult.status, 'active');
      assert.equal(apexResult.coverageAmount, 450000.00);
      assert.equal(apexResult.premiumAmount, 155.25);
      assert.equal(apexResult.clientBirthday, '1985-10-15');
      assert.equal(apexResult.clientAge, 40);
    });

    test('rejects normalization with informative error for unsupported carriers', () => {
      assert.throws(() => {
        carrierRegistry.normalize('prudential_direct', {});
      }, /Unsupported carrier: 'prudential_direct'/);
    });

    test('supports plug-and-play registration of a third mock carrier', () => {
      const customRegistry = new CarrierRegistry(false);
      assert.equal(customRegistry.listSupported().length, 0);

      // Create a third mock carrier adapter
      const guardianAdapter = {
        carrierId: 'guardian-shield',
        carrierName: 'Guardian Shield Life',
        validatePayload(raw) {
          return raw && typeof raw === 'object' && 'shieldId' in raw;
        },
        normalize(raw) {
          return {
            carrierId: 'guardian-shield',
            carrierName: 'Guardian Shield Life',
            policyNumber: raw.shieldId,
            clientName: raw.holderName,
            clientBirthday: '1990-01-01',
            clientAge: 36,
            status: 'active',
            rawStatus: 'ACTIVE',
            coverageAmount: 1000000,
            premiumAmount: 300,
            premiumFrequency: 'monthly',
            duration: {
              effectiveDate: '2020-01-01',
              tenureMonths: 80,
              isRenewable: true
            },
            missedPayments: {
              hasMissedPayment: false,
              missedCount: 0,
              totalAmountDue: 0
            },
            productType: 'Whole Life',
            syncedAt: new Date().toISOString()
          };
        },
        calculateAge() {
          return 36;
        }
      };

      customRegistry.register(guardianAdapter, ['guardian', 'GUARDIAN_SHIELD']);
      assert.equal(customRegistry.listSupported().length, 1);
      assert.ok(customRegistry.has('guardian'));

      const result = customRegistry.normalize('GUARDIAN', { shieldId: 'GS-777', holderName: 'Alice Springs' });
      assert.equal(result.carrierId, 'guardian-shield');
      assert.equal(result.policyNumber, 'GS-777');
      assert.equal(result.coverageAmount, 1000000);

      // Test unregister
      assert.equal(customRegistry.unregister('guardian-shield'), true);
      assert.equal(customRegistry.has('guardian'), false);
      assert.equal(customRegistry.listSupported().length, 0);
    });
  });
});
