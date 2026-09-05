const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  carrierRegistry,
  AcmeMutualAdapter,
  ApexLifeAdapter
} = require('../../services/carrier/CarrierRegistry.ts');

const ROOT_DIR = path.resolve(__dirname, '../..');

describe('Milestone M3: CRM Admin UI & Client Views Integration Suite', () => {

  describe('1. File Verification & Component Signatures', () => {
    test('UserSessionProfileModal.tsx exists and defines required props and sections', () => {
      const modalPath = path.join(ROOT_DIR, 'components/analytics/UserSessionProfileModal.tsx');
      assert.ok(fs.existsSync(modalPath), 'UserSessionProfileModal.tsx must exist');
      const content = fs.readFileSync(modalPath, 'utf8');

      // Check intent score gauge & qualification levels
      assert.ok(content.includes('intentScore'), 'Must track intent score');
      assert.ok(content.includes('Hot') && content.includes('Warm') && content.includes('Cold'), 'Must support Hot, Warm, Cold intent classifications');
      assert.ok(content.includes('TargetedAdRecommendation'), 'Must display targeted ad recommendations');
      assert.ok(content.includes('categoryAffinity'), 'Must display category affinity breakdown');
      assert.ok(content.includes('marketingTags'), 'Must display marketing tags');
      assert.ok(content.includes('15-Min Session History') || content.includes('15-minute'), 'Must display 15-minute session history timeline');
      assert.ok(content.includes('linkedLead'), 'Must display linked CRM lead details');
    });

    test('NormalizedPolicySection.tsx exists and renders all 6 normalized policy fields', () => {
      const sectionPath = path.join(ROOT_DIR, 'components/crm/NormalizedPolicySection.tsx');
      assert.ok(fs.existsSync(sectionPath), 'NormalizedPolicySection.tsx must exist');
      const content = fs.readFileSync(sectionPath, 'utf8');

      // 6 required fields
      assert.ok(content.includes('Field 1 • Policy Status') || content.includes('Policy Status'), 'Field 1: Status badge');
      assert.ok(content.includes('Field 2 • Premium Amount') || content.includes('Premium Amount'), 'Field 2: Premium amount and frequency');
      assert.ok(content.includes('Field 3 • Total Coverage Benefit') || content.includes('Total Coverage Benefit'), 'Field 3: Total Coverage benefit amount');
      assert.ok(content.includes('Field 4 • Insured Birthday & Age') || content.includes('Insured Birthday & Age'), 'Field 4: Insured Client Birthday & calculated Age');
      assert.ok(content.includes('Field 5 • Missed Payments Status') || content.includes('Missed Payments Status'), 'Field 5: Missed Payments status (clean vs delinquent, grace period)');
      assert.ok(content.includes('Field 6 • Policy Duration & Tenure') || content.includes('Policy Duration & Tenure'), 'Field 6: Policy Duration (issue date, tenure, expiration)');

      // Carrier badge and interactive sync button
      assert.ok(content.includes('Sync Carrier Data'), 'Must include interactive Sync Carrier Data button');
      assert.ok(content.includes('carrierRegistry.normalize'), 'Must execute carrierRegistry.normalize');
    });

    test('AdminAnalytics.tsx integrates User/IP intelligence selector bar and modal', () => {
      const adminPath = path.join(ROOT_DIR, 'pages/admin/AdminAnalytics.tsx');
      const content = fs.readFileSync(adminPath, 'utf8');

      assert.ok(content.includes('UserSessionProfileModal'), 'Must import and mount UserSessionProfileModal');
      assert.ok(content.includes('User / IP Intelligence & Behavioral Profile Inspector'), 'Must include intelligence selector title');
      assert.ok(content.includes('192.168.1.105'), 'Must include quick test preset for simulated IP');
      assert.ok(content.includes('vis_user_test_01'), 'Must include quick test preset for simulated visitor');
      assert.ok(content.includes('alexander.anderson@example.com'), 'Must include quick test preset for lead email');
      assert.ok(content.includes('Inspect Profile'), 'Must include inspect profile action');
      assert.ok(content.includes('handleInspect'), 'Must include click-to-inspect handler on table rows');
    });

    test('Clients.tsx integrates carrier_policy tab and NormalizedPolicySection', () => {
      const clientsPath = path.join(ROOT_DIR, 'pages/crm/Clients.tsx');
      const content = fs.readFileSync(clientsPath, 'utf8');

      assert.ok(content.includes('carrier_policy'), 'Must support carrier_policy modal tab');
      assert.ok(content.includes('NormalizedPolicySection'), 'Must mount NormalizedPolicySection');
      assert.ok(content.includes('Carrier Policy'), 'Must render Carrier Policy tab button');
      assert.ok(content.includes('handleCarrierPolicyUpdated'), 'Must update client record in real time on carrier sync');
    });

    test('analyticsService.ts exports typed intelligence profiling methods', () => {
      const servicePath = path.join(ROOT_DIR, 'services/analyticsService.ts');
      const content = fs.readFileSync(servicePath, 'utf8');

      assert.ok(content.includes('getProfile'), 'Must export getProfile');
      assert.ok(content.includes('querySessions'), 'Must export querySessions');
      assert.ok(content.includes('getTrackedEntities'), 'Must export getTrackedEntities');
      assert.ok(content.includes('TargetedAdRecommendation'), 'Must export TargetedAdRecommendation type');
    });
  });

  describe('2. Universal Carrier Normalization in UI Context', () => {
    test('AcmeMutualAdapter produces all 6 normalized fields matching schema', () => {
      const rawAcme = {
        contract_id: 'ACM-POL-882190',
        insured_party: {
          full_legal_name: 'Eleanor Vance',
          dob: '1983-05-14',
          contact_email: 'eleanor.vance@example.com'
        },
        policy_details: {
          plan_code: 'TERM_20_PREMIER',
          policy_status: 'IN_FORCE',
          issue_date: '2021/04/15',
          expiry_date: '2041/04/15',
          term_years: 20,
          renewable_flag: true
        },
        coverage: {
          face_amount_cents: 50000000
        },
        billing: {
          modal_premium_cents: 240000,
          frequency: 'ANNUAL',
          past_due_installments: 0,
          past_due_cents: 0
        }
      };

      const normalized = carrierRegistry.normalize('acme-mutual', rawAcme, {
        referenceDate: new Date('2026-09-03T12:00:00.000Z')
      });

      // 1. Status
      assert.equal(normalized.status, 'active');
      assert.equal(normalized.rawStatus, 'IN_FORCE');

      // 2. Premium & Frequency
      assert.equal(normalized.premiumAmount, 2400);
      assert.equal(normalized.premiumFrequency, 'annual');

      // 3. Total Coverage
      assert.equal(normalized.coverageAmount, 500000);
      assert.equal(normalized.productType, 'Term Life (20-Year)');

      // 4. Birthday & Age
      assert.equal(normalized.clientBirthday, '1983-05-14');
      assert.equal(normalized.clientAge, 43);

      // 5. Missed Payments Status
      assert.equal(normalized.missedPayments.hasMissedPayment, false);
      assert.equal(normalized.missedPayments.missedCount, 0);
      assert.equal(normalized.missedPayments.totalAmountDue, 0);

      // 6. Policy Duration & Tenure
      assert.equal(normalized.duration.effectiveDate, '2021-04-15');
      assert.equal(normalized.duration.expirationDate, '2041-04-15');
      assert.equal(normalized.duration.termYears, 20);
      assert.equal(normalized.duration.tenureMonths, 64);
      assert.equal(normalized.duration.isRenewable, true);
    });

    test('ApexLifeAdapter produces delinquent and grace period normalization correctly', () => {
      const rawApex = {
        provider: 'ApexLife InsurTech',
        policyId: 'APX-LIFE-9042',
        customer: {
          name: 'Marcus Bennett',
          birthDate: '1979-11-28T00:00:00.000Z',
          email: 'marcus.bennett@example.com',
          phone: '+1 (555) 492-8812'
        },
        state: 'PAYMENT_PENDING',
        planType: 'Apex Universal Life Plus',
        benefitAmount: 750000.00,
        periodicRate: 215.50,
        billingSchedule: 'monthly',
        inceptionDate: '2022-02-01T00:00:00.000Z',
        expirationDate: '2052-02-01T00:00:00.000Z',
        termYears: 30,
        renewable: true,
        delinquentPayments: 1,
        totalPastDue: 215.50,
        lastPaymentFailureDate: '2026-08-01T00:00:00.000Z',
        gracePeriodEnd: '2026-09-20T00:00:00.000Z'
      };

      const normalized = carrierRegistry.normalize('apex-life', rawApex, {
        referenceDate: new Date('2026-09-03T12:00:00.000Z')
      });

      // 1. Status
      assert.equal(normalized.status, 'inactive'); // In grace period
      assert.equal(normalized.rawStatus, 'PAYMENT_PENDING');

      // 2. Premium & Frequency
      assert.equal(normalized.premiumAmount, 215.50);
      assert.equal(normalized.premiumFrequency, 'monthly');

      // 3. Total Coverage
      assert.equal(normalized.coverageAmount, 750000);

      // 4. Birthday & Age
      assert.equal(normalized.clientBirthday, '1979-11-28');
      assert.equal(normalized.clientAge, 46);

      // 5. Missed Payments Status (Delinquent + Grace Period)
      assert.equal(normalized.missedPayments.hasMissedPayment, true);
      assert.equal(normalized.missedPayments.missedCount, 1);
      assert.equal(normalized.missedPayments.totalAmountDue, 215.50);
      assert.equal(normalized.missedPayments.lastMissedDate, '2026-08-01');
      assert.equal(normalized.missedPayments.gracePeriodEndsAt, '2026-09-20');

      // 6. Policy Duration & Tenure
      assert.equal(normalized.duration.effectiveDate, '2022-02-01');
      assert.equal(normalized.duration.tenureMonths, 55);
      assert.equal(normalized.duration.isRenewable, true);
    });
  });
});
