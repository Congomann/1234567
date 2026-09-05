/**
 * scripts/verify-carrier-adapter.mjs
 * 
 * Programmatic Verification Script for Modular Carrier API Framework & Adapters (Milestone M4)
 * 
 * Requirements:
 * 1. Executes mock carrier adapters (AcmeMutualAdapter and ApexLifeAdapter) with dummy API payloads.
 * 2. Verifies that both adapters correctly normalize data:
 *    - Extracts active status ('active' | 'inactive' | 'lapsed').
 *    - Extracts and normalizes premium amount ($ dollars).
 *    - Extracts client birthday and calculates client age.
 *    - Extracts coverage benefit amount.
 *    - Extracts missed payments (count, amount due, grace period).
 *    - Extracts policy duration (effective date, tenure months, expiration).
 * 3. Verifies plug-and-play CarrierRegistry lookup and normalization dispatch.
 * 4. Exits with code 0 on pass, non-zero (1) on failure.
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

// Console colors for clean test reporting
const ANSI = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

function logHeader(title) {
  console.log(`\n${ANSI.cyan}${ANSI.bold}================================================================================${ANSI.reset}`);
  console.log(`${ANSI.cyan}${ANSI.bold}  ${title}${ANSI.reset}`);
  console.log(`${ANSI.cyan}${ANSI.bold}================================================================================${ANSI.reset}\n`);
}

function logStep(stepNum, description) {
  console.log(`${ANSI.yellow}${ANSI.bold}[Step ${stepNum}]${ANSI.reset} ${description}`);
}

function logPass(checkName, details = '') {
  console.log(`  ${ANSI.green}✔ PASS:${ANSI.reset} ${checkName} ${details ? `${ANSI.dim}(${details})${ANSI.reset}` : ''}`);
}

function logFail(checkName, error) {
  console.error(`  ${ANSI.red}✖ FAIL:${ANSI.reset} ${checkName}`);
  console.error(`    ${ANSI.red}${error.message || error}${ANSI.reset}`);
}

async function runCarrierAdapterVerification() {
  logHeader('VERIFY MODULAR CARRIER API FRAMEWORK & ADAPTERS (R2 / M4)');

  const startTime = Date.now();
  let totalAssertions = 0;

  function countAssert(fn, description, details = '') {
    try {
      fn();
      totalAssertions++;
      logPass(description, details);
    } catch (err) {
      logFail(description, err);
      throw err;
    }
  }

  // Reference fixed test date for deterministic calculations: 2026-09-03
  const refDate = new Date('2026-09-03T12:00:00.000Z');

  try {
    // -------------------------------------------------------------------------
    // SUITE 1: AcmeMutualAdapter (Legacy Carrier Normalization)
    // -------------------------------------------------------------------------
    logStep(1, 'Testing AcmeMutualAdapter: Legacy Schema Normalization');
    const acmeAdapter = new AcmeMutualAdapter();

    // 1.1 Active Legacy Policy Payload
    const acmeActivePayload = {
      carrier_code: 'ACME_MUTUAL',
      contract_id: 'ACM-TEST-88921-X',
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

    const normAcmeActive = acmeAdapter.normalize(acmeActivePayload, { referenceDate: refDate });

    countAssert(() => {
      assert.equal(normAcmeActive.carrierId, 'acme-mutual');
      assert.equal(normAcmeActive.policyNumber, 'ACM-TEST-88921-X');
      assert.equal(normAcmeActive.status, 'active');
      assert.equal(normAcmeActive.rawStatus, 'IN_FORCE');
    }, 'AcmeMutual extracts active status from "IN_FORCE"', `status: ${normAcmeActive.status}`);

    countAssert(() => {
      assert.equal(normAcmeActive.premiumAmount, 145.00);
      assert.equal(normAcmeActive.premiumFrequency, 'monthly');
    }, 'AcmeMutual converts integer cents to dollars for premium', `$${normAcmeActive.premiumAmount} / ${normAcmeActive.premiumFrequency}`);

    countAssert(() => {
      assert.equal(normAcmeActive.clientBirthday, '1982-06-14');
      assert.equal(normAcmeActive.clientAge, 44);
    }, 'AcmeMutual formats birthday YYYY-MM-DD and computes age', `DOB: ${normAcmeActive.clientBirthday}, Age: ${normAcmeActive.clientAge}`);

    countAssert(() => {
      assert.equal(normAcmeActive.coverageAmount, 500000.00);
    }, 'AcmeMutual converts integer cents to dollars for coverage benefit', `$${normAcmeActive.coverageAmount.toLocaleString()}`);

    countAssert(() => {
      assert.equal(normAcmeActive.missedPayments.hasMissedPayment, false);
      assert.equal(normAcmeActive.missedPayments.missedCount, 0);
      assert.equal(normAcmeActive.missedPayments.totalAmountDue, 0.00);
    }, 'AcmeMutual extracts clean payment status when current', '0 missed payments');

    countAssert(() => {
      assert.equal(normAcmeActive.duration.effectiveDate, '2020-06-01');
      assert.equal(normAcmeActive.duration.expirationDate, '2040-06-01');
      assert.equal(normAcmeActive.duration.termYears, 20);
      assert.equal(normAcmeActive.duration.tenureMonths, 75);
      assert.equal(normAcmeActive.duration.isRenewable, true);
    }, 'AcmeMutual computes policy duration and tenure months', `Effective: ${normAcmeActive.duration.effectiveDate}, Tenure: ${normAcmeActive.duration.tenureMonths} mos`);

    // 1.2 Inactive / Delinquent Legacy Policy Payload
    const acmeInactivePayload = {
      carrier_code: 'ACME_MUTUAL',
      contract_id: 'ACM-TEST-99342-Y',
      insured_party: {
        full_legal_name: 'Arthur Pendelton',
        dob: '1975/11/04',
        contact_email: 'arthur.p@example.com'
      },
      policy_details: {
        plan_code: 'WHOLE_LIFE_ESTATE',
        policy_status: 'GRACE_PERIOD',
        issue_date: '2015/03/01'
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

    const normAcmeInactive = acmeAdapter.normalize(acmeInactivePayload, { referenceDate: refDate });

    countAssert(() => {
      assert.equal(normAcmeInactive.status, 'inactive');
      assert.equal(normAcmeInactive.missedPayments.hasMissedPayment, true);
      assert.equal(normAcmeInactive.missedPayments.missedCount, 1);
      assert.equal(normAcmeInactive.missedPayments.totalAmountDue, 320.00);
      assert.equal(normAcmeInactive.missedPayments.lastMissedDate, '2026-08-01');
      assert.equal(normAcmeInactive.missedPayments.gracePeriodEndsAt, '2026-09-30');
    }, 'AcmeMutual extracts inactive status, missed payments, past due and grace period', `status: ${normAcmeInactive.status}, due: $${normAcmeInactive.missedPayments.totalAmountDue}, grace: ${normAcmeInactive.missedPayments.gracePeriodEndsAt}`);

    // 1.3 Lapsed Legacy Policy Payload
    const acmeLapsedPayload = {
      contract_id: 'ACM-TEST-11002-Z',
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

    const normAcmeLapsed = acmeAdapter.normalize(acmeLapsedPayload, { referenceDate: refDate });

    countAssert(() => {
      assert.equal(normAcmeLapsed.status, 'lapsed');
      assert.equal(normAcmeLapsed.rawStatus, 'LAPSED');
    }, 'AcmeMutual extracts lapsed status from "LAPSED"', `status: ${normAcmeLapsed.status}`);

    // 1.4 Schema Validation
    countAssert(() => {
      assert.equal(acmeAdapter.validatePayload(acmeActivePayload), true);
      assert.equal(acmeAdapter.validatePayload(null), false);
      assert.equal(acmeAdapter.validatePayload({}), false);
      assert.equal(acmeAdapter.validatePayload({ contract_id: '123' }), false);
      assert.throws(() => acmeAdapter.normalize({ contract_id: '123' }), /Invalid payload schema/);
    }, 'AcmeMutual validates payload schema and rejects malformed inputs');

    // -------------------------------------------------------------------------
    // SUITE 2: ApexLifeAdapter (Modern InsurTech Normalization)
    // -------------------------------------------------------------------------
    logStep(2, 'Testing ApexLifeAdapter: Modern InsurTech Schema Normalization');
    const apexAdapter = new ApexLifeAdapter();

    // 2.1 Active InsurTech Policy Payload
    const apexActivePayload = {
      provider: 'ApexLife InsurTech',
      policyId: 'APX-TEST-2024-9912',
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

    const normApexActive = apexAdapter.normalize(apexActivePayload, { referenceDate: refDate });

    countAssert(() => {
      assert.equal(normApexActive.carrierId, 'apex-life');
      assert.equal(normApexActive.policyNumber, 'APX-TEST-2024-9912');
      assert.equal(normApexActive.status, 'active');
      assert.equal(normApexActive.rawStatus, 'CURRENT');
    }, 'ApexLife extracts active status from "CURRENT"', `status: ${normApexActive.status}`);

    countAssert(() => {
      assert.equal(normApexActive.premiumAmount, 215.50);
      assert.equal(normApexActive.premiumFrequency, 'monthly');
    }, 'ApexLife normalizes decimal float premium amount', `$${normApexActive.premiumAmount} / ${normApexActive.premiumFrequency}`);

    countAssert(() => {
      assert.equal(normApexActive.clientBirthday, '1991-03-29');
      assert.equal(normApexActive.clientAge, 35);
    }, 'ApexLife parses ISO timestamp birthday and computes age', `DOB: ${normApexActive.clientBirthday}, Age: ${normApexActive.clientAge}`);

    countAssert(() => {
      assert.equal(normApexActive.coverageAmount, 750000.00);
    }, 'ApexLife normalizes coverage benefit amount', `$${normApexActive.coverageAmount.toLocaleString()}`);

    countAssert(() => {
      assert.equal(normApexActive.missedPayments.hasMissedPayment, false);
      assert.equal(normApexActive.missedPayments.missedCount, 0);
      assert.equal(normApexActive.missedPayments.totalAmountDue, 0.00);
    }, 'ApexLife extracts clean payment status when current', '0 delinquent payments');

    countAssert(() => {
      assert.equal(normApexActive.duration.effectiveDate, '2022-01-15');
      assert.equal(normApexActive.duration.expirationDate, '2052-01-15');
      assert.equal(normApexActive.duration.termYears, 30);
      assert.equal(normApexActive.duration.tenureMonths, 55);
      assert.equal(normApexActive.duration.isRenewable, true);
    }, 'ApexLife extracts policy duration, expiration, and tenure months', `Effective: ${normApexActive.duration.effectiveDate}, Tenure: ${normApexActive.duration.tenureMonths} mos`);

    // 2.2 Inactive / Delinquent InsurTech Policy Payload
    const apexInactivePayload = {
      provider: 'ApexLife InsurTech',
      policyId: 'APX-TEST-2024-8841',
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

    const normApexInactive = apexAdapter.normalize(apexInactivePayload, { referenceDate: refDate });

    countAssert(() => {
      assert.equal(normApexInactive.status, 'inactive');
      assert.equal(normApexInactive.missedPayments.hasMissedPayment, true);
      assert.equal(normApexInactive.missedPayments.missedCount, 2);
      assert.equal(normApexInactive.missedPayments.totalAmountDue, 360.00);
      assert.equal(normApexInactive.missedPayments.lastMissedDate, '2026-08-15');
      assert.equal(normApexInactive.missedPayments.gracePeriodEndsAt, '2026-09-15');
    }, 'ApexLife extracts inactive status, delinquent count, past due and grace period', `status: ${normApexInactive.status}, delinquent: ${normApexInactive.missedPayments.missedCount}, due: $${normApexInactive.missedPayments.totalAmountDue}`);

    // 2.3 Lapsed InsurTech Policy Payload
    const apexLapsedPayload = {
      policyId: 'APX-TEST-2021-0012',
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

    const normApexLapsed = apexAdapter.normalize(apexLapsedPayload, { referenceDate: refDate });

    countAssert(() => {
      assert.equal(normApexLapsed.status, 'lapsed');
      assert.equal(normApexLapsed.rawStatus, 'TERMINATED');
    }, 'ApexLife extracts lapsed status from "TERMINATED"', `status: ${normApexLapsed.status}`);

    // 2.4 Schema Validation
    countAssert(() => {
      assert.equal(apexAdapter.validatePayload(apexActivePayload), true);
      assert.equal(apexAdapter.validatePayload(null), false);
      assert.equal(apexAdapter.validatePayload({}), false);
      assert.equal(apexAdapter.validatePayload({ policyId: '123' }), false);
      assert.throws(() => apexAdapter.normalize({ policyId: '123' }), /Invalid payload schema/);
    }, 'ApexLife validates payload schema and rejects malformed inputs');

    // -------------------------------------------------------------------------
    // SUITE 3: CarrierRegistry Plug-and-Play Integration & Dispatch
    // -------------------------------------------------------------------------
    logStep(3, 'Testing CarrierRegistry: Plug-and-Play Lookup & Normalization Dispatch');

    countAssert(() => {
      const supported = carrierRegistry.listSupported();
      assert.equal(supported.length >= 2, true);
      const ids = supported.map(c => c.carrierId);
      assert.ok(ids.includes('acme-mutual'));
      assert.ok(ids.includes('apex-life'));
    }, 'CarrierRegistry pre-registers AcmeMutual and ApexLife adapters', `Registered: ${carrierRegistry.listSupported().map(c => c.carrierId).join(', ')}`);

    countAssert(() => {
      // Case-insensitive and alias resolution
      assert.ok(carrierRegistry.get('acme-mutual') instanceof AcmeMutualAdapter);
      assert.ok(carrierRegistry.get('acme_mutual') instanceof AcmeMutualAdapter);
      assert.ok(carrierRegistry.get('ACME_MUTUAL') instanceof AcmeMutualAdapter);
      assert.ok(carrierRegistry.get('Acme Mutual') instanceof AcmeMutualAdapter);

      assert.ok(carrierRegistry.get('apex-life') instanceof ApexLifeAdapter);
      assert.ok(carrierRegistry.get('apex_life') instanceof ApexLifeAdapter);
      assert.ok(carrierRegistry.get('APEX_LIFE') instanceof ApexLifeAdapter);
      assert.ok(carrierRegistry.get('ApexLife') instanceof ApexLifeAdapter);

      assert.equal(carrierRegistry.get('unknown-carrier'), undefined);
      assert.equal(carrierRegistry.has('unknown-carrier'), false);
    }, 'CarrierRegistry resolves canonical IDs, snake_case, uppercase, and display aliases');

    // 3.1 Normalization Dispatch via Registry
    countAssert(() => {
      const dispatchedAcme = carrierRegistry.normalize('ACME_MUTUAL', acmeActivePayload, { referenceDate: refDate });
      assert.equal(dispatchedAcme.carrierId, 'acme-mutual');
      assert.equal(dispatchedAcme.status, 'active');
      assert.equal(dispatchedAcme.premiumAmount, 145.00);
      assert.equal(dispatchedAcme.clientBirthday, '1982-06-14');
      assert.equal(dispatchedAcme.clientAge, 44);

      const dispatchedApex = carrierRegistry.normalize('apex_life', apexActivePayload, { referenceDate: refDate });
      assert.equal(dispatchedApex.carrierId, 'apex-life');
      assert.equal(dispatchedApex.status, 'active');
      assert.equal(dispatchedApex.premiumAmount, 215.50);
      assert.equal(dispatchedApex.clientBirthday, '1991-03-29');
      assert.equal(dispatchedApex.clientAge, 35);
    }, 'CarrierRegistry successfully dispatches normalization for both carrier schemas');

    // 3.2 Error Handling on Unsupported Carrier or Invalid Payload
    countAssert(() => {
      assert.throws(() => {
        carrierRegistry.normalize('unregistered-carrier', {});
      }, /Unsupported carrier/);

      assert.throws(() => {
        carrierRegistry.normalize('acme-mutual', { bad: 'data' });
      }, /Payload failed validation/);
    }, 'CarrierRegistry throws descriptive errors for unsupported carriers or invalid payloads');

    // 3.3 Dynamic Third-Party Adapter Registration (Plug-and-Play)
    countAssert(() => {
      const customRegistry = new CarrierRegistry(false);

      class ZenithLifeAdapter {
        constructor() {
          this.carrierId = 'zenith-life';
          this.carrierName = 'Zenith Life Insurance';
        }
        validatePayload(p) {
          return !!(p && p.zenithPolicyNumber);
        }
        normalize(p) {
          return {
            carrierId: this.carrierId,
            carrierName: this.carrierName,
            policyNumber: p.zenithPolicyNumber,
            clientName: p.insuredName,
            clientBirthday: '1985-05-15',
            clientAge: 41,
            status: 'active',
            rawStatus: 'VALID',
            coverageAmount: 1000000,
            premiumAmount: 300,
            premiumFrequency: 'monthly',
            duration: { effectiveDate: '2021-01-01', tenureMonths: 68, isRenewable: true },
            missedPayments: { hasMissedPayment: false, missedCount: 0, totalAmountDue: 0 },
            productType: 'Zenith Premier Term',
            syncedAt: new Date().toISOString()
          };
        }
        calculateAge() { return 41; }
      }

      customRegistry.register(new ZenithLifeAdapter(), ['zenith', 'ZENITH_LIFE', 'Zenith Life']);
      assert.equal(customRegistry.has('zenith'), true);
      assert.equal(customRegistry.has('ZENITH_LIFE'), true);

      const result = customRegistry.normalize('zenith', { zenithPolicyNumber: 'ZEN-991' });
      assert.equal(result.carrierId, 'zenith-life');
      assert.equal(result.policyNumber, 'ZEN-991');
      assert.equal(result.status, 'active');
      assert.equal(result.coverageAmount, 1000000);
    }, 'CarrierRegistry supports dynamic registration and normalization dispatch of new custom adapters');

    // -------------------------------------------------------------------------
    // SUMMARY REPORT
    // -------------------------------------------------------------------------
    const elapsed = Date.now() - startTime;
    console.log(`\n${ANSI.green}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.log(`${ANSI.green}${ANSI.bold}  CARRIER ADAPTER VERIFICATION COMPLETED SUCCESSFULLY (100% PASS)${ANSI.reset}`);
    console.log(`${ANSI.green}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.log(`  • Total Assertions Verified   : ${ANSI.bold}${totalAssertions}${ANSI.reset}`);
    console.log(`  • Execution Duration          : ${ANSI.bold}${elapsed} ms${ANSI.reset}`);
    console.log(`  • AcmeMutualAdapter (Legacy)  : Active, Inactive, Lapsed, Birthday, Age, Premium, Missed Payments, Duration`);
    console.log(`  • ApexLifeAdapter (InsurTech) : Active, Inactive, Lapsed, Birthday, Age, Premium, Missed Payments, Duration`);
    console.log(`  • CarrierRegistry Integration : Canonical lookup, Aliases, Normalization dispatch, Dynamic registration`);
    console.log(`  • Exit Code                   : 0\n`);

    process.exit(0);

  } catch (error) {
    console.error(`\n${ANSI.red}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.error(`${ANSI.red}${ANSI.bold}  CARRIER ADAPTER VERIFICATION FAILED${ANSI.reset}`);
    console.error(`${ANSI.red}${ANSI.bold}================================================================================${ANSI.reset}`);
    console.error(error.stack || error);
    process.exit(1);
  }
}

runCarrierAdapterVerification();
