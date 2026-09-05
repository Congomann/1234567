/**
 * scripts/stress-test-carrier.mjs
 * 
 * Adversarial Empirical Stress Test Suite for Modular Carrier API Framework
 * Challenger: challenger_bt_2 (Empirical Challenger)
 * 
 * Tests Edge Conditions, Corrupted Data, Boundary Dates, Registry Stress, and Concurrency.
 */

import assert from 'node:assert/strict';
import {
  AcmeMutualAdapter,
  ApexLifeAdapter,
  CarrierRegistry,
  carrierRegistry,
  calculateAge,
  calculateTenureMonths,
  normalizeDateToYMD,
  normalizeFrequency
} from '../services/carrier/index.ts';

const ANSI = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function banner(title) {
  console.log(`\n${ANSI.magenta}${ANSI.bold}${'='.repeat(80)}${ANSI.reset}`);
  console.log(`${ANSI.magenta}${ANSI.bold}  ADVERSARIAL STRESS TEST: ${title}${ANSI.reset}`);
  console.log(`${ANSI.magenta}${ANSI.bold}${'='.repeat(80)}${ANSI.reset}\n`);
}

function suite(title) {
  console.log(`\n${ANSI.cyan}${ANSI.bold}--- [SUITE] ${title} ---${ANSI.reset}`);
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

function runStressCheck(description, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ${ANSI.green}✔ PASS:${ANSI.reset} ${description}`);
  } catch (err) {
    failedTests++;
    failures.push({ description, error: err });
    console.error(`  ${ANSI.red}✖ FAIL:${ANSI.reset} ${description}`);
    console.error(`    ${ANSI.red}${err.message || err}${ANSI.reset}`);
  }
}

async function runAsyncStressCheck(description, fn) {
  totalTests++;
  try {
    await fn();
    passedTests++;
    console.log(`  ${ANSI.green}✔ PASS:${ANSI.reset} ${description}`);
  } catch (err) {
    failedTests++;
    failures.push({ description, error: err });
    console.error(`  ${ANSI.red}✖ FAIL:${ANSI.reset} ${description}`);
    console.error(`    ${ANSI.red}${err.message || err}${ANSI.reset}`);
  }
}

async function main() {
  banner('MODULAR CARRIER API FRAMEWORK - ADVERSARIAL VERIFICATION');

  const startTime = Date.now();
  const testRefDate = new Date('2026-09-03T12:00:00.000Z');

  // =========================================================================
  // SUITE 1: Malformed, Partial, or Corrupted Payloads
  // =========================================================================
  suite('1. Malformed, Partial, or Corrupted Payloads');

  const acme = new AcmeMutualAdapter();
  const apex = new ApexLifeAdapter();

  runStressCheck('1.1 Acme: Rejects primitives, null, undefined, arrays, and empty objects', () => {
    const primitives = [null, undefined, '', 'bad string', 12345, true, false, [], [1, 2, 3], {}];
    for (const item of primitives) {
      assert.equal(acme.validatePayload(item), false, `Should reject ${JSON.stringify(item)}`);
      assert.throws(() => acme.normalize(item), /Invalid payload schema/);
    }
  });

  runStressCheck('1.2 Apex: Rejects primitives, null, undefined, arrays, and empty objects', () => {
    const primitives = [null, undefined, '', 'bad string', 12345, true, false, [], [1, 2, 3], {}];
    for (const item of primitives) {
      assert.equal(apex.validatePayload(item), false, `Should reject ${JSON.stringify(item)}`);
      assert.throws(() => apex.normalize(item), /Invalid payload schema/);
    }
  });

  runStressCheck('1.3 Acme: Rejects partial payload missing coverage, billing, or insured_party', () => {
    const base = {
      contract_id: 'ACM-TEST',
      insured_party: { full_legal_name: 'John Doe', dob: '1980/01/01' },
      policy_details: { policy_status: 'IN_FORCE', issue_date: '2020/01/01' },
      coverage: { face_amount_cents: 100000 },
      billing: { modal_premium_cents: 5000, frequency: 'MONTHLY' }
    };

    // Missing coverage
    const noCoverage = { ...base };
    delete noCoverage.coverage;
    assert.equal(acme.validatePayload(noCoverage), false);
    assert.throws(() => acme.normalize(noCoverage), /Invalid payload schema/);

    // Missing billing
    const noBilling = { ...base };
    delete noBilling.billing;
    assert.equal(acme.validatePayload(noBilling), false);
    assert.throws(() => acme.normalize(noBilling), /Invalid payload schema/);

    // Missing insured_party
    const noParty = { ...base };
    delete noParty.insured_party;
    assert.equal(acme.validatePayload(noParty), false);

    // Missing policy_details
    const noDetails = { ...base };
    delete noDetails.policy_details;
    assert.equal(acme.validatePayload(noDetails), false);

    // Missing contract_id
    const noId = { ...base };
    delete noId.contract_id;
    assert.equal(acme.validatePayload(noId), false);
  });

  runStressCheck('1.4 Apex: Rejects partial payload missing benefitAmount, periodicRate, inceptionDate, or customer', () => {
    const base = {
      policyId: 'APX-TEST',
      customer: { name: 'Jane Doe', birthDate: '1990-05-10' },
      state: 'CURRENT',
      benefitAmount: 500000,
      periodicRate: 150,
      inceptionDate: '2021-01-01'
    };

    // Missing benefitAmount
    const noBenefit = { ...base };
    delete noBenefit.benefitAmount;
    assert.equal(apex.validatePayload(noBenefit), false);

    // Missing periodicRate
    const noRate = { ...base };
    delete noRate.periodicRate;
    assert.equal(apex.validatePayload(noRate), false);

    // Missing inceptionDate
    const noInception = { ...base };
    delete noInception.inceptionDate;
    assert.equal(apex.validatePayload(noInception), false);

    // Missing customer
    const noCust = { ...base };
    delete noCust.customer;
    assert.equal(apex.validatePayload(noCust), false);

    // Missing state
    const noState = { ...base };
    delete noState.state;
    assert.equal(apex.validatePayload(noState), false);
  });

  runStressCheck('1.5 Acme & Apex: Reject non-numeric strings in numeric currency fields', () => {
    // Acme with string cents
    const acmeStringCents = {
      contract_id: 'ACM-TEST',
      insured_party: { full_legal_name: 'John Doe', dob: '1980/01/01' },
      policy_details: { policy_status: 'IN_FORCE', issue_date: '2020/01/01' },
      coverage: { face_amount_cents: '50000000' }, // STRING
      billing: { modal_premium_cents: 14500, frequency: 'MONTHLY' }
    };
    assert.equal(acme.validatePayload(acmeStringCents), false);

    const acmeStringPremium = {
      contract_id: 'ACM-TEST',
      insured_party: { full_legal_name: 'John Doe', dob: '1980/01/01' },
      policy_details: { policy_status: 'IN_FORCE', issue_date: '2020/01/01' },
      coverage: { face_amount_cents: 50000000 },
      billing: { modal_premium_cents: '14500', frequency: 'MONTHLY' } // STRING
    };
    assert.equal(acme.validatePayload(acmeStringPremium), false);

    // Apex with string benefit
    const apexStringBenefit = {
      policyId: 'APX-TEST',
      customer: { name: 'Jane Doe', birthDate: '1990-05-10' },
      state: 'CURRENT',
      benefitAmount: '$500,000', // STRING
      periodicRate: 150,
      inceptionDate: '2021-01-01'
    };
    assert.equal(apex.validatePayload(apexStringBenefit), false);

    const apexStringRate = {
      policyId: 'APX-TEST',
      customer: { name: 'Jane Doe', birthDate: '1990-05-10' },
      state: 'CURRENT',
      benefitAmount: 500000,
      periodicRate: '150.00', // STRING
      inceptionDate: '2021-01-01'
    };
    assert.equal(apex.validatePayload(apexStringRate), false);
  });

  runStressCheck('1.6 Acme & Apex: Negative amounts clamped gracefully to zero', () => {
    // Negative cents in Acme
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
    assert.equal(acme.validatePayload(acmeNegative), true);
    const normAcme = acme.normalize(acmeNegative, { referenceDate: testRefDate });
    assert.equal(normAcme.coverageAmount, 0, 'Coverage should clamp negative to 0');
    assert.equal(normAcme.premiumAmount, 0, 'Premium should clamp negative to 0');
    assert.equal(normAcme.missedPayments.missedCount, 0, 'Missed count should clamp negative to 0');
    assert.equal(normAcme.missedPayments.totalAmountDue, 0, 'Total due should clamp negative to 0');
    assert.equal(normAcme.missedPayments.hasMissedPayment, false);

    // Negative amounts in Apex
    const apexNegative = {
      policyId: 'APX-NEG',
      customer: { name: 'Negative Ned', birthDate: '1990-01-01' },
      state: 'CURRENT',
      benefitAmount: -250000,
      periodicRate: -99.99,
      inceptionDate: '2021-01-01',
      delinquentPayments: -2,
      totalPastDue: -500
    };
    assert.equal(apex.validatePayload(apexNegative), true);
    const normApex = apex.normalize(apexNegative, { referenceDate: testRefDate });
    assert.equal(normApex.coverageAmount, 0, 'Coverage should clamp negative to 0');
    assert.equal(normApex.premiumAmount, 0, 'Premium should clamp negative to 0');
    assert.equal(normApex.missedPayments.missedCount, 0, 'Missed count should clamp negative to 0');
    assert.equal(normApex.missedPayments.totalAmountDue, 0, 'Total due should clamp negative to 0');
  });

  runStressCheck('1.7 Adversarial content: SQL injection, XSS, and massive payload strings', () => {
    const attackString = "Robert'); DROP TABLE clients; <script>alert('xss')</script> -- " + "A".repeat(5000);
    const attackPayload = {
      contract_id: attackString,
      insured_party: {
        full_legal_name: attackString,
        dob: '1980/01/01',
        contact_email: 'attacker@example.com'
      },
      policy_details: {
        plan_code: attackString,
        policy_status: 'IN_FORCE',
        issue_date: '2020/01/01'
      },
      coverage: { face_amount_cents: 10000000 },
      billing: { modal_premium_cents: 10000, frequency: 'MONTHLY' }
    };
    assert.equal(acme.validatePayload(attackPayload), true);
    const norm = acme.normalize(attackPayload, { referenceDate: testRefDate });
    assert.equal(norm.policyNumber, attackString);
    assert.equal(norm.clientName, attackString);
    assert.equal(norm.status, 'active');
  });

  // =========================================================================
  // SUITE 2: Extreme Ages, Centenary Clients, Infants, Leap Year Dates
  // =========================================================================
  suite('2. Extreme Ages, Centenary Clients, Infants, Leap Year Dates');

  runStressCheck('2.1 Centenary Clients (Ages 100 to 146)', () => {
    // Born in 1920: 2026-09-03 - 1920-01-01 = 106 years
    assert.equal(calculateAge('1920-01-01', testRefDate), 106);
    assert.equal(calculateAge('1920-09-03', testRefDate), 106); // exact birthday
    assert.equal(calculateAge('1920-09-04', testRefDate), 105); // day before 106th birthday
    assert.equal(calculateAge('1900-01-01', testRefDate), 126);
    assert.equal(calculateAge('1880-01-01', testRefDate), 146);

    // Verify through AcmeMutualAdapter
    const centenaryPayload = {
      contract_id: 'ACM-CENTENARY-106',
      insured_party: { full_legal_name: 'Hazel Centenarian', dob: '1920/02/15' },
      policy_details: { policy_status: 'IN_FORCE', issue_date: '1945/01/01' },
      coverage: { face_amount_cents: 5000000 },
      billing: { modal_premium_cents: 2500, frequency: 'ANNUAL' }
    };
    const normCentenary = acme.normalize(centenaryPayload, { referenceDate: testRefDate });
    assert.equal(normCentenary.clientAge, 106);
    assert.equal(normCentenary.clientBirthday, '1920-02-15');
    // Tenure from 1945 to 2026 = 81 years * 12 + 8 months = 980 months
    assert.equal(normCentenary.duration.tenureMonths, 980);
  });

  runStressCheck('2.2 Infants & Newborns (Age 0)', () => {
    // Born today
    assert.equal(calculateAge('2026-09-03', testRefDate), 0);
    // Born yesterday
    assert.equal(calculateAge('2026-09-02', testRefDate), 0);
    // Born 6 months ago
    assert.equal(calculateAge('2026-03-01', testRefDate), 0);
    // Born 364 days ago (Sept 4, 2025)
    assert.equal(calculateAge('2025-09-04', testRefDate), 0);
    // Born exactly 1 year ago (Sept 3, 2025)
    assert.equal(calculateAge('2025-09-03', testRefDate), 1);

    // Verify through ApexLifeAdapter
    const infantPayload = {
      policyId: 'APX-INFANT-001',
      customer: { name: 'Baby Oliver', birthDate: '2026-04-10T00:00:00.000Z' },
      state: 'CURRENT',
      benefitAmount: 100000,
      periodicRate: 25,
      inceptionDate: '2026-05-01T00:00:00.000Z'
    };
    const normInfant = apex.normalize(infantPayload, { referenceDate: testRefDate });
    assert.equal(normInfant.clientAge, 0);
    assert.equal(normInfant.clientBirthday, '2026-04-10');
  });

  runStressCheck('2.3 Future birthdates clamped to age 0', () => {
    assert.equal(calculateAge('2027-01-01', testRefDate), 0);
    assert.equal(calculateAge('2030-05-20', testRefDate), 0);
    assert.equal(calculateAge('2099-12-31', testRefDate), 0);
  });

  runStressCheck('2.4 Leap Year Birthday Calculations (Feb 29)', () => {
    // Born Feb 29, 2000
    // Test 1: Evaluated on non-leap year Feb 28, 2026 (birthday not reached yet)
    const refFeb28_2026 = new Date('2026-02-28T12:00:00.000Z');
    assert.equal(calculateAge('2000-02-29', refFeb28_2026), 25, 'Feb 28 in non-leap year should be age 25');

    // Test 2: Evaluated on non-leap year March 1, 2026 (birthday reached)
    const refMar01_2026 = new Date('2026-03-01T12:00:00.000Z');
    assert.equal(calculateAge('2000-02-29', refMar01_2026), 26, 'March 1 in non-leap year should be age 26');

    // Test 3: Evaluated on leap year Feb 28, 2024 (day before leap birthday)
    const refFeb28_2024 = new Date('2024-02-28T12:00:00.000Z');
    assert.equal(calculateAge('2000-02-29', refFeb28_2024), 23, 'Feb 28 in leap year should be age 23');

    // Test 4: Evaluated on leap year Feb 29, 2024 (exact leap birthday)
    const refFeb29_2024 = new Date('2024-02-29T12:00:00.000Z');
    assert.equal(calculateAge('2000-02-29', refFeb29_2024), 24, 'Feb 29 in leap year should be age 24');

    // Test 5: Born on leap year Feb 29, 1980 via AcmeMutual slash format "1980/02/29"
    const leapAcme = {
      contract_id: 'ACM-LEAP-01',
      insured_party: { full_legal_name: 'Leap Year Child', dob: '1980/02/29' },
      policy_details: { policy_status: 'IN_FORCE', issue_date: '2016/02/29' },
      coverage: { face_amount_cents: 20000000 },
      billing: { modal_premium_cents: 10000, frequency: 'MONTHLY' }
    };
    const normLeap = acme.normalize(leapAcme, { referenceDate: testRefDate });
    assert.equal(normLeap.clientBirthday, '1980-02-29');
    assert.equal(normLeap.clientAge, 46);
    assert.equal(normLeap.duration.effectiveDate, '2016-02-29');
  });

  runStressCheck('2.5 Malformed and corrupted date strings fallback gracefully without crashing', () => {
    const badDates = ['', 'not-a-date', 'undefined', 'null', '9999-99-99', '2020-00-00', 'invalid/date'];
    for (const d of badDates) {
      assert.equal(calculateAge(d, testRefDate), 0, `calculateAge should return 0 for "${d}"`);
      assert.equal(calculateTenureMonths(d, testRefDate), 0, `calculateTenureMonths should return 0 for "${d}"`);
    }
  });

  // =========================================================================
  // SUITE 3: Unknown Carrier Codes and Unhandled Raw Statuses
  // =========================================================================
  suite('3. Unknown Carrier Codes and Unhandled Raw Statuses');

  runStressCheck('3.1 Registry rejects unknown carrier codes with descriptive error', () => {
    const unknownCarriers = ['unknown', 'NONEXISTENT', 'prudential', 'mutual_of_omaha', '12345', ''];
    for (const code of unknownCarriers) {
      assert.equal(carrierRegistry.has(code), false);
      assert.equal(carrierRegistry.get(code), undefined);
      assert.throws(() => {
        carrierRegistry.normalize(code, {});
      }, /Unsupported carrier/);
    }
  });

  runStressCheck('3.2 Acme: Unhandled raw statuses map cleanly to active or inactive based on past due', () => {
    const bizarreStatuses = [
      'UNDERWRITING_REVIEW',
      'SUSPENDED_LEGAL',
      'PENDING_DOCS',
      'AUDIT_IN_PROGRESS',
      'REINSTATEMENT_REQUESTED',
      'CUSTOM_STATUS_XYZ'
    ];

    for (const st of bizarreStatuses) {
      // With zero past due -> fallback is 'active'
      const payloadZeroPastDue = {
        contract_id: `ACM-ST-${st}`,
        insured_party: { full_legal_name: 'Status Tester', dob: '1985/01/01' },
        policy_details: { policy_status: st, issue_date: '2020/01/01' },
        coverage: { face_amount_cents: 1000000 },
        billing: { modal_premium_cents: 5000, frequency: 'MONTHLY', past_due_installments: 0 }
      };
      const norm1 = acme.normalize(payloadZeroPastDue, { referenceDate: testRefDate });
      assert.equal(norm1.status, 'active');
      assert.equal(norm1.rawStatus, st);

      // With past due > 0 -> fallback is 'inactive'
      const payloadWithPastDue = {
        ...payloadZeroPastDue,
        billing: { modal_premium_cents: 5000, frequency: 'MONTHLY', past_due_installments: 2, past_due_cents: 10000 }
      };
      const norm2 = acme.normalize(payloadWithPastDue, { referenceDate: testRefDate });
      assert.equal(norm2.status, 'inactive');
      assert.equal(norm2.rawStatus, st);
    }
  });

  runStressCheck('3.3 Apex: Unhandled raw states map cleanly to active or inactive based on delinquent count', () => {
    const bizarreStates = [
      'SPECIAL_INVESTIGATION',
      'PAYMENT_PROCESSING',
      'RENEWAL_HOLD',
      'UNKNOWN_STATE'
    ];

    for (const st of bizarreStates) {
      // Delinquent = 0 -> 'active'
      const payloadDelinq0 = {
        policyId: `APX-ST-${st}`,
        customer: { name: 'State Tester', birthDate: '1990-01-01' },
        state: st,
        benefitAmount: 500000,
        periodicRate: 200,
        inceptionDate: '2021-01-01',
        delinquentPayments: 0
      };
      const norm1 = apex.normalize(payloadDelinq0, { referenceDate: testRefDate });
      assert.equal(norm1.status, 'active');
      assert.equal(norm1.rawStatus, st);

      // Delinquent > 0 -> 'inactive'
      const payloadDelinq2 = {
        ...payloadDelinq0,
        delinquentPayments: 3,
        totalPastDue: 600
      };
      const norm2 = apex.normalize(payloadDelinq2, { referenceDate: testRefDate });
      assert.equal(norm2.status, 'inactive');
      assert.equal(norm2.rawStatus, st);
    }
  });

  runStressCheck('3.4 Bizarre and non-standard payment frequencies normalize safely', () => {
    assert.equal(normalizeFrequency('monthly'), 'monthly');
    assert.equal(normalizeFrequency('MONTHLY'), 'monthly');
    assert.equal(normalizeFrequency('quarterly'), 'quarterly');
    assert.equal(normalizeFrequency('QUARTER'), 'quarterly');
    assert.equal(normalizeFrequency('semi-annual'), 'semi-annual');
    assert.equal(normalizeFrequency('SEMI_ANNUAL'), 'semi-annual');
    assert.equal(normalizeFrequency('semiannual'), 'semi-annual');
    assert.equal(normalizeFrequency('annual'), 'annual');
    assert.equal(normalizeFrequency('YEARLY'), 'annual');
    assert.equal(normalizeFrequency('Yearly'), 'annual');
    // Non-standard strings default to monthly safely
    assert.equal(normalizeFrequency('bi-weekly'), 'monthly');
    assert.equal(normalizeFrequency('random_garbage'), 'monthly');
    assert.equal(normalizeFrequency(''), 'monthly');
    assert.equal(normalizeFrequency(undefined), 'monthly');
    assert.equal(normalizeFrequency(null), 'monthly');
  });

  // =========================================================================
  // SUITE 4: Registry Lookup Abuse, Dynamic Registration Under Stress & Concurrency
  // =========================================================================
  suite('4. Registry Lookup Abuse, Dynamic Registration Under Stress & Concurrency');

  runStressCheck('4.1 Registry lookup handles extreme casing, hyphens, underscores, and spacing', () => {
    const acmePermutations = [
      'acme-mutual',
      'ACME-MUTUAL',
      'AcMe-MuTuAl',
      'acme_mutual',
      'ACME_MUTUAL',
      'Acme_Mutual',
      'acme mutual',
      'Acme Mutual',
      'ACME MUTUAL',
      '   acme-mutual   ',
      '  ACME_MUTUAL  ',
      'acme'
    ];

    for (const key of acmePermutations) {
      assert.ok(carrierRegistry.has(key), `Registry should have "${key}"`);
      const adapter = carrierRegistry.get(key);
      assert.ok(adapter instanceof AcmeMutualAdapter, `Key "${key}" should return AcmeMutualAdapter`);
    }

    const apexPermutations = [
      'apex-life',
      'APEX-LIFE',
      'Apex-Life',
      'apex_life',
      'APEX_LIFE',
      'Apex_Life',
      'apex life',
      'Apex Life',
      'APEX LIFE',
      'ApexLife',
      'apex',
      'Apex Life InsurTech',
      '  APEX_LIFE  '
    ];

    for (const key of apexPermutations) {
      assert.ok(carrierRegistry.has(key), `Registry should have "${key}"`);
      const adapter = carrierRegistry.get(key);
      assert.ok(adapter instanceof ApexLifeAdapter, `Key "${key}" should return ApexLifeAdapter`);
    }
  });

  runStressCheck('4.2 Safe handling of non-standard and prototype collision keys', () => {
    // Plain JS Object prototypes
    const prototypeKeys = ['toString', 'valueOf', 'constructor', '__proto__', 'hasOwnProperty', 'isPrototypeOf'];
    for (const key of prototypeKeys) {
      assert.equal(carrierRegistry.has(key), false);
      assert.equal(carrierRegistry.get(key), undefined);
    }
  });

  runStressCheck('4.3 Dynamic Registration Stress: Register and unregister 1,000 mock adapters', () => {
    const stressRegistry = new CarrierRegistry(false);
    const COUNT = 1000;

    // Mass registration
    for (let i = 0; i < COUNT; i++) {
      const carrierId = `carrier-stress-${i}`;
      const carrierName = `Stress Carrier ${i}`;
      const mockAdapter = {
        carrierId,
        carrierName,
        validatePayload: (p) => !!p && p.valid === true,
        normalize: (p) => ({
          carrierId,
          carrierName,
          policyNumber: `POL-${i}`,
          clientName: `Client ${i}`,
          clientBirthday: '1990-01-01',
          clientAge: 36,
          status: 'active',
          rawStatus: 'ACTIVE',
          coverageAmount: 100000 + i,
          premiumAmount: 100 + i,
          premiumFrequency: 'monthly',
          duration: { effectiveDate: '2020-01-01', tenureMonths: 80, isRenewable: true },
          missedPayments: { hasMissedPayment: false, missedCount: 0, totalAmountDue: 0 },
          productType: 'Stress Life',
          syncedAt: new Date().toISOString()
        }),
        calculateAge: () => 36
      };

      stressRegistry.register(mockAdapter, [`stress_${i}`, `STRESS ${i}`]);
    }

    assert.equal(stressRegistry.listSupported().length, COUNT);

    // Verify spot lookups across permutations
    assert.ok(stressRegistry.has('carrier-stress-42'));
    assert.ok(stressRegistry.has('stress_42'));
    assert.ok(stressRegistry.has('STRESS 42'));
    assert.ok(stressRegistry.has('carrier-stress-999'));

    const res = stressRegistry.normalize('stress_500', { valid: true });
    assert.equal(res.carrierId, 'carrier-stress-500');
    assert.equal(res.policyNumber, 'POL-500');
    assert.equal(res.coverageAmount, 100500);

    // Mass unregistration
    for (let i = 0; i < COUNT; i++) {
      const removed = stressRegistry.unregister(`carrier-stress-${i}`);
      assert.equal(removed, true);
    }

    assert.equal(stressRegistry.listSupported().length, 0);
    assert.equal(stressRegistry.has('carrier-stress-42'), false);
    assert.equal(stressRegistry.has('stress_42'), false);
  });

  runStressCheck('4.4 Adapter replacement / re-registration updates cleanly', () => {
    const tempRegistry = new CarrierRegistry(false);
    const adapter1 = {
      carrierId: 'beta-life',
      carrierName: 'Beta Life v1',
      validatePayload: () => true,
      normalize: () => ({ policyNumber: 'V1' }),
      calculateAge: () => 30
    };
    tempRegistry.register(adapter1, ['beta']);
    assert.equal(tempRegistry.get('beta')?.carrierName, 'Beta Life v1');

    // Register replacement v2
    const adapter2 = {
      carrierId: 'beta-life',
      carrierName: 'Beta Life v2',
      validatePayload: () => true,
      normalize: () => ({ policyNumber: 'V2' }),
      calculateAge: () => 30
    };
    tempRegistry.register(adapter2, ['beta']);
    assert.equal(tempRegistry.get('beta')?.carrierName, 'Beta Life v2');
    assert.equal(tempRegistry.listSupported().length, 1);
  });

  await runAsyncStressCheck('4.5 High-Concurrency Normalization Stress (10,000 operations)', async () => {
    const ITERATIONS = 10000;
    const promises = [];

    const sampleAcme = {
      contract_id: 'ACM-CONCURRENCY',
      insured_party: { full_legal_name: 'Concurrent Charlie', dob: '1988/08/08' },
      policy_details: { policy_status: 'IN_FORCE', issue_date: '2021/01/01' },
      coverage: { face_amount_cents: 40000000 },
      billing: { modal_premium_cents: 12000, frequency: 'MONTHLY' }
    };

    const sampleApex = {
      policyId: 'APX-CONCURRENCY',
      customer: { name: 'Concurrent Clara', birthDate: '1995-12-12T00:00:00.000Z' },
      state: 'CURRENT',
      benefitAmount: 600000,
      periodicRate: 180,
      inceptionDate: '2022-03-15T00:00:00.000Z'
    };

    for (let i = 0; i < ITERATIONS; i++) {
      if (i % 2 === 0) {
        promises.push(
          Promise.resolve().then(() => carrierRegistry.normalize('acme_mutual', sampleAcme, { referenceDate: testRefDate }))
        );
      } else {
        promises.push(
          Promise.resolve().then(() => carrierRegistry.normalize('apex-life', sampleApex, { referenceDate: testRefDate }))
        );
      }
    }

    const results = await Promise.all(promises);
    assert.equal(results.length, ITERATIONS);

    // Verify random samples
    assert.equal(results[0].carrierId, 'acme-mutual');
    assert.equal(results[0].status, 'active');
    assert.equal(results[0].premiumAmount, 120.00);

    assert.equal(results[1].carrierId, 'apex-life');
    assert.equal(results[1].status, 'active');
    assert.equal(results[1].premiumAmount, 180.00);
  });

  // =========================================================================
  // SUMMARY
  // =========================================================================
  const duration = Date.now() - startTime;
  console.log(`\n${ANSI.magenta}${ANSI.bold}${'='.repeat(80)}${ANSI.reset}`);
  console.log(`${ANSI.magenta}${ANSI.bold}  ADVERSARIAL STRESS TEST SUMMARY${ANSI.reset}`);
  console.log(`${ANSI.magenta}${ANSI.bold}${'='.repeat(80)}${ANSI.reset}`);
  console.log(`  • Total Tests Executed       : ${ANSI.bold}${totalTests}${ANSI.reset}`);
  console.log(`  • Passed Tests               : ${ANSI.green}${ANSI.bold}${passedTests}${ANSI.reset}`);
  console.log(`  • Failed Tests               : ${failedTests > 0 ? ANSI.red : ANSI.green}${ANSI.bold}${failedTests}${ANSI.reset}`);
  console.log(`  • Execution Duration         : ${duration} ms`);

  if (failedTests > 0) {
    console.error(`\n${ANSI.red}${ANSI.bold}FAILED ASSUMPTIONS / BUGS FOUND (${failedTests}):${ANSI.reset}`);
    for (const f of failures) {
      console.error(`  - ${f.description}: ${f.error.message}`);
    }
    process.exit(1);
  } else {
    console.log(`\n${ANSI.green}${ANSI.bold}ALL ADVERSARIAL CHALLENGES PASSED EMPIRICALLY (100% PASS)${ANSI.reset}\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Fatal crash during stress test harness:', err);
  process.exit(1);
});
