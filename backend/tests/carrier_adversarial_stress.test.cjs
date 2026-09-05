const { test, describe } = require('node:test');
const assert = require('node:assert/strict');

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

const TEST_REF_DATE = new Date('2026-09-03T12:00:00.000Z');

describe('Adversarial Stress Testing: Modular Carrier API Framework', () => {
  const acme = new AcmeMutualAdapter();
  const apex = new ApexLifeAdapter();

  describe('1. Malformed, Partial, or Corrupted Payloads', () => {
    test('rejects non-object primitives and null across both adapters', () => {
      const primitives = [null, undefined, '', 'bad string', 12345, true, false, [], [1, 2, 3], {}];
      for (const item of primitives) {
        assert.equal(acme.validatePayload(item), false);
        assert.equal(apex.validatePayload(item), false);
        assert.throws(() => acme.normalize(item), /Invalid payload schema/);
        assert.throws(() => apex.normalize(item), /Invalid payload schema/);
      }
    });

    test('rejects partial objects with missing core sections', () => {
      const baseAcme = {
        contract_id: 'ACM-TEST',
        insured_party: { full_legal_name: 'John Doe', dob: '1980/01/01' },
        policy_details: { policy_status: 'IN_FORCE', issue_date: '2020/01/01' },
        coverage: { face_amount_cents: 100000 },
        billing: { modal_premium_cents: 5000, frequency: 'MONTHLY' }
      };

      const noCoverage = { ...baseAcme };
      delete noCoverage.coverage;
      assert.equal(acme.validatePayload(noCoverage), false);

      const noBilling = { ...baseAcme };
      delete noBilling.billing;
      assert.equal(acme.validatePayload(noBilling), false);

      const baseApex = {
        policyId: 'APX-TEST',
        customer: { name: 'Jane Doe', birthDate: '1990-05-10' },
        state: 'CURRENT',
        benefitAmount: 500000,
        periodicRate: 150,
        inceptionDate: '2021-01-01'
      };

      const noBenefit = { ...baseApex };
      delete noBenefit.benefitAmount;
      assert.equal(apex.validatePayload(noBenefit), false);

      const noCustomer = { ...baseApex };
      delete noCustomer.customer;
      assert.equal(apex.validatePayload(noCustomer), false);
    });

    test('rejects non-numeric string values in currency amounts', () => {
      const acmeStringCents = {
        contract_id: 'ACM-TEST',
        insured_party: { full_legal_name: 'John Doe', dob: '1980/01/01' },
        policy_details: { policy_status: 'IN_FORCE', issue_date: '2020/01/01' },
        coverage: { face_amount_cents: '50000000' },
        billing: { modal_premium_cents: 14500, frequency: 'MONTHLY' }
      };
      assert.equal(acme.validatePayload(acmeStringCents), false);

      const apexStringRate = {
        policyId: 'APX-TEST',
        customer: { name: 'Jane Doe', birthDate: '1990-05-10' },
        state: 'CURRENT',
        benefitAmount: 500000,
        periodicRate: '150.00',
        inceptionDate: '2021-01-01'
      };
      assert.equal(apex.validatePayload(apexStringRate), false);
    });

    test('clamps negative currency and installment amounts to zero', () => {
      const acmeNegative = {
        contract_id: 'ACM-NEG',
        insured_party: { full_legal_name: 'Negative Nancy', dob: '1985/05/05' },
        policy_details: { policy_status: 'IN_FORCE', issue_date: '2020/01/01' },
        coverage: { face_amount_cents: -5000000 },
        billing: {
          modal_premium_cents: -15000,
          frequency: 'MONTHLY',
          past_due_installments: -3,
          past_due_cents: -5000
        }
      };
      const normAcme = acme.normalize(acmeNegative, { referenceDate: TEST_REF_DATE });
      assert.equal(normAcme.coverageAmount, 0);
      assert.equal(normAcme.premiumAmount, 0);
      assert.equal(normAcme.missedPayments.missedCount, 0);
      assert.equal(normAcme.missedPayments.totalAmountDue, 0);
      assert.equal(normAcme.missedPayments.hasMissedPayment, false);
    });
  });

  describe('2. Extreme Dates and Boundary Ages', () => {
    test('handles centenary clients up to 146 years old', () => {
      assert.equal(calculateAge('1920-01-01', TEST_REF_DATE), 106);
      assert.equal(calculateAge('1900-01-01', TEST_REF_DATE), 126);
      assert.equal(calculateAge('1880-01-01', TEST_REF_DATE), 146);
    });

    test('handles infants, newborns, and future dates without negative ages', () => {
      assert.equal(calculateAge('2026-09-03', TEST_REF_DATE), 0);
      assert.equal(calculateAge('2026-01-01', TEST_REF_DATE), 0);
      assert.equal(calculateAge('2030-01-01', TEST_REF_DATE), 0);
    });

    test('calculates leap year birthdays correctly across leap and non-leap years', () => {
      const refFeb28_2026 = new Date('2026-02-28T12:00:00.000Z');
      assert.equal(calculateAge('2000-02-29', refFeb28_2026), 25);

      const refMar01_2026 = new Date('2026-03-01T12:00:00.000Z');
      assert.equal(calculateAge('2000-02-29', refMar01_2026), 26);

      const refFeb29_2024 = new Date('2024-02-29T12:00:00.000Z');
      assert.equal(calculateAge('2000-02-29', refFeb29_2024), 24);
    });

    test('gracefully recovers from unparseable dates without throwing', () => {
      assert.equal(calculateAge('garbage-date', TEST_REF_DATE), 0);
      assert.equal(calculateTenureMonths('garbage-date', TEST_REF_DATE), 0);
      assert.equal(normalizeDateToYMD('garbage-date'), 'garbage-date');
    });
  });

  describe('3. Unknown Carriers and Unhandled Statuses', () => {
    test('rejects unknown carrier lookups and normalizations', () => {
      assert.equal(carrierRegistry.has('unknown-carrier'), false);
      assert.equal(carrierRegistry.get('unknown-carrier'), undefined);
      assert.throws(() => {
        carrierRegistry.normalize('unknown-carrier', {});
      }, /Unsupported carrier/);
    });

    test('gracefully normalizes unhandled raw statuses into active or inactive', () => {
      const payloadAcme = {
        contract_id: 'ACM-CUSTOM',
        insured_party: { full_legal_name: 'Custom Status Client', dob: '1985/01/01' },
        policy_details: { policy_status: 'UNDERWRITING_REVIEW', issue_date: '2020/01/01' },
        coverage: { face_amount_cents: 1000000 },
        billing: { modal_premium_cents: 5000, frequency: 'MONTHLY', past_due_installments: 0 }
      };
      const res = acme.normalize(payloadAcme, { referenceDate: TEST_REF_DATE });
      assert.equal(res.status, 'active');
      assert.equal(res.rawStatus, 'UNDERWRITING_REVIEW');

      const payloadDelinquent = {
        ...payloadAcme,
        billing: { modal_premium_cents: 5000, frequency: 'MONTHLY', past_due_installments: 1 }
      };
      const resDelinq = acme.normalize(payloadDelinquent, { referenceDate: TEST_REF_DATE });
      assert.equal(resDelinq.status, 'inactive');
      assert.equal(resDelinq.rawStatus, 'UNDERWRITING_REVIEW');
    });

    test('normalizes exotic frequency strings to monthly fallback', () => {
      assert.equal(normalizeFrequency('fortnightly'), 'monthly');
      assert.equal(normalizeFrequency('bi-monthly'), 'monthly');
      assert.equal(normalizeFrequency(null), 'monthly');
    });
  });

  describe('4. Registry Abuse, Dynamic Registration & Concurrency', () => {
    test('resolves case, hyphen, underscore, and space variations', () => {
      const variations = ['acme-mutual', 'ACME_MUTUAL', '  Acme Mutual  ', 'acme'];
      for (const v of variations) {
        assert.ok(carrierRegistry.has(v));
        assert.ok(carrierRegistry.get(v) instanceof AcmeMutualAdapter);
      }
    });

    test('resists prototype pollution keys', () => {
      for (const key of ['toString', 'constructor', '__proto__', 'valueOf']) {
        assert.equal(carrierRegistry.has(key), false);
        assert.equal(carrierRegistry.get(key), undefined);
      }
    });

    test('stress tests dynamic registration and unregistration of 500 carriers', () => {
      const registry = new CarrierRegistry(false);
      for (let i = 0; i < 500; i++) {
        registry.register({
          carrierId: `dyn-${i}`,
          carrierName: `Dynamic ${i}`,
          validatePayload: () => true,
          normalize: () => ({ carrierId: `dyn-${i}` }),
          calculateAge: () => 30
        }, [`alias_${i}`]);
      }
      assert.equal(registry.listSupported().length, 500);
      assert.ok(registry.has('alias_250'));
      assert.ok(registry.has('dyn-499'));

      for (let i = 0; i < 500; i++) {
        assert.equal(registry.unregister(`dyn-${i}`), true);
      }
      assert.equal(registry.listSupported().length, 0);
      assert.equal(registry.has('alias_250'), false);
    });

    test('handles concurrent normalization under load without errors', async () => {
      const payload = {
        policyId: 'APX-CONCURRENT',
        customer: { name: 'Concurrent User', birthDate: '1990-01-01T00:00:00.000Z' },
        state: 'CURRENT',
        benefitAmount: 500000,
        periodicRate: 150,
        inceptionDate: '2021-01-01T00:00:00.000Z'
      };

      const tasks = Array.from({ length: 2000 }, () =>
        Promise.resolve().then(() => carrierRegistry.normalize('apex-life', payload, { referenceDate: TEST_REF_DATE }))
      );

      const results = await Promise.all(tasks);
      assert.equal(results.length, 2000);
      assert.equal(results[0].status, 'active');
      assert.equal(results[1999].premiumAmount, 150.00);
    });
  });
});
