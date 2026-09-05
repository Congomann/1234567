# Handoff Report: Carrier Framework & Testing Infrastructure Survey (M0)

**Author**: Survey Explorer 3 (Carrier Framework & Testing Infrastructure)  
**Date**: 2026-09-03  
**Working Directory**: `/Users/newholland/1234567/.agents/explorer_bt_survey_3`  
**Target Milestone**: R2 Modular Carrier API Framework & Programmatic Verification Infrastructure  

---

## 1. Observation

### 1.1 Existing Package Configuration & Test Runners
Direct inspection of `/Users/newholland/1234567/package.json` revealed:
- **Project Module System**: `"type": "module"` (line 5).
- **Existing Scripts** (lines 6–17):
  ```json
  "scripts": {
    "dev": "vite",
    "db:init": "chmod +x local_setup.sh && ./local_setup.sh",
    "server:local": "node backend/server.cjs",
    "start:prod": "node backend/server.cjs",
    "simulator": "node backend/scripts/adSimulator.cjs",
    "simulator:once": "node backend/scripts/adSimulator.cjs --once",
    "test": "node --test backend/tests/*.test.cjs",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "typescript --noEmit"
  }
  ```
- **Dependencies & DevDependencies** (lines 18–68):
  - **No Jest, Vitest, Mocha, or tsx** are installed in `dependencies` or `devDependencies`.
  - Installed toolchain includes `node` (Node runtime), `typescript` (`~5.8.2`), `@types/node` (`^22.14.0`), `vite` (`^6.2.0`), `@vitejs/plugin-react` (`^5.0.0`), `playwright` (`^1.58.2`).
- **Runtime Environment**:
  - `node -v` output: **`v24.14.0`**
  - `npm -v` output: **`11.11.1`**
  - Node `v24.14.0` natively supports `node:test`, `node:assert/strict`, and `--experimental-strip-types` / `--experimental-transform-types`.

### 1.2 Existing Test Infrastructure & Sandbox Behavior
- Direct execution of `npm test` (`node --test backend/tests/*.test.cjs`):
  - Failed with `connect EPERM 127.0.0.1:<port>` when attempting to bind/connect loopback TCP sockets in sandbox.
  - Verbatim error from `backend/tests/m4_webhooks_simulator.test.cjs`:
    `[TypeError: fetch failed] { [cause]: Error: connect EPERM 127.0.0.1:58649 - Local (0.0.0.0:0) ... code: 'EPERM' }`
- Direct execution of `node -e` with `node:test` and in-memory assertions:
  - Exited with code `0`: `✔ pure test (0.37ms) ... pass 1, fail 0`.
- Direct execution of `node --experimental-strip-types -e 'import { test } ...'`:
  - Exited with code `0`: `✔ ts test (1.93ms) ... pass 1, fail 0`.
- Inspection of `/Users/newholland/1234567/tests/e2e/runner.mjs`:
  - An established custom ESM test runner exists that executes tests in tiers with built-in in-memory fallback handlers when external servers are offline.
  - Direct execution of `node tests/e2e/runner.mjs` exited with code `0`.

### 1.3 Existing Carrier & Policy Types
- Direct inspection of `/Users/newholland/1234567/types.ts`:
  - Line 453:
    ```typescript
    export interface Carrier {
      name: string;
      category: string;
    }
    ```
  - Lines 336–351:
    ```typescript
    export interface Client {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      street?: string;
      city?: string;
      state?: string;
      zip?: string;
      policyNumber: string;
      premium: number;
      product: ProductType;
      renewalDate: string;
      commissionAmount?: number;
      carrier?: string;
    }
    ```
  - Lines 610–619:
    ```typescript
    export interface Application {
      id: string;
      leadId: string;
      clientName: string;
      carrier: string;
      policyNumber: string;
      status: ApplicationStatus;
      premium: number;
      commission?: number;
    }
    ```
  - **Finding**: There is **no Carrier API Framework**, no adapter interface, no normalized policy schema, no missed payment tracking, no birthday field on `Client` or `Policy`, and no policy duration model in `types.ts`.

### 1.4 Existing Database & Backend Routes for Sessions & Clients
- Direct inspection of `/Users/newholland/1234567/backend/schema.sql`:
  - Lines 75–93: `CREATE TABLE clients (...)` contains `product`, `policy_number`, `carrier`, `premium`, `renewal_date`, `commission_amount`, `address`. It lacks `birthday`, `status` (active/inactive/lapsed), `missed_payments`, `coverage_amount`, and `duration`.
  - Lines 283–323: Analytics tables exist: `analytics_visitors`, `analytics_sessions`, `analytics_page_views`.
  - Lines 300–307:
    ```sql
    CREATE TABLE analytics_sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        visitor_id VARCHAR(100) REFERENCES analytics_visitors(visitor_id) ON DELETE CASCADE,
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ended_at TIMESTAMP WITH TIME ZONE,
        duration_seconds INT DEFAULT 0,
        session_metadata JSONB
    );
    ```
- Direct inspection of `/Users/newholland/1234567/backend/server.cjs` (lines 4394–4473):
  - `/api/analytics/collect` updates a session if `sessionId` is passed from the client, or creates a new session if `sessionId` is absent.
  - It does **not** currently implement the 15-minute sliding inactivity window automatically on the server side: if a client sends a stale `sessionId` hours later, it continues updating the same session.

### 1.5 Existing CRM UI Components for Policies
- Direct inspection of `/Users/newholland/1234567/pages/crm/Clients.tsx`:
  - Displays a table with columns: `Client Name`, `Policy Info`, `Premium`, `Status`, `Contact`, `Carrier`.
  - Status is calculated purely by date difference: `diffDays < 0 ? 'Expired' : diffDays < 30 ? 'Renewing Soon' : 'Active'`.
  - Modal (lines 316–367) allows editing `policyNumber`, `product`, `carrier`, `premium`, `renewalDate`.
  - Lacks display of: normalized policy status, coverage amounts, birthdays, missed payments / delinquencies, policy duration / tenure, or sync timestamps.

---

## 2. Logic Chain

### 2.1 Why a Universal Adapter Architecture is Necessary for R2
1. **Heterogeneity of Carrier APIs**: Different insurance carriers (e.g. Acme Mutual vs. Apex Life) expose drastically different data formats:
   - Field naming conventions (snake_case vs. camelCase vs. PascalCase).
   - Date formats (`YYYY/MM/DD` vs. ISO 8601 `YYYY-MM-DDTHH:mm:ssZ` vs. Unix epoch).
   - Status classifications (`"IN_FORCE"` vs. `"CURRENT"` vs. `"Active"`).
   - Currency formats (cents as integers vs. dollars as floats/strings).
   - Nested vs. flat payloads (e.g. `billing.past_due_installments` vs. `delinquentPayments`).
2. **Decoupling and Extensibility**: By defining a universal `CarrierAdapter<TRawPayload>` interface and `CarrierRegistry`, new carriers can be registered plug-and-play without modifying existing CRM UI code, database logic, or other carrier adapters.
3. **Strict Normalization Contract**: All adapters must emit a guaranteed, fully validated `NormalizedPolicyData` structure satisfying all requirements of R2.

### 2.2 Why Node Native Test Infrastructure (`node:test`) is the Optimal Choice
1. **Zero New Dependencies**: `package.json` already defines `"test": "node --test backend/tests/*.test.cjs"`. Adding Jest or Vitest would introduce hundreds of MB of dependencies and potential version conflicts with existing React 18 / Vite 6 configurations.
2. **Node 24 Native Capabilities**: Node `v24.14.0` has first-class support for `node:test`, `node:assert/strict`, and `--experimental-strip-types`.
3. **Sandbox Resilience**: In restricted sandbox environments, running tests against a real TCP port fails with `EPERM`. By designing tests with in-memory service execution and standalone CLI verification scripts (following the pattern of `adSimulator.cjs` and `runner.mjs`), verification runs deterministically in any environment with 0 ms network latency.

### 2.3 Logic for Script 1 (15-Minute Sessionization Verification)
1. Requirement: "Simulating user visiting 3 different pages in a 15-minute window and verifying storage as a unified session in the database."
2. **Algorithmic Rule**:
   - `Session Timeout Threshold` = 15 minutes (900,000 ms).
   - When a page view event arrives for `visitorId`:
     - Look up the active session for `visitorId`.
     - If an active session exists AND `(currentTime - lastActivityTime) <= 15 minutes`:
       - Append page view to current session.
       - Update session `ended_at = currentTime`, `duration_seconds = (currentTime - started_at)`.
     - If no active session exists OR `(currentTime - lastActivityTime) > 15 minutes`:
       - Mark previous session as closed/finalized.
       - Create a new session with `started_at = currentTime`.
3. **Verification Protocol**:
   - Event 1: `T0` (`10:00:00`), Page: `/` -> Creates Session `S1`.
   - Event 2: `T0 + 5 min` (`10:05:00`), Page: `/insurance/life` -> Appends to `S1` (`pageViews = 2`, `duration = 300s`).
   - Event 3: `T0 + 12 min` (`10:12:00`), Page: `/quote/calculate` -> Appends to `S1` (`pageViews = 3`, `duration = 720s`).
   - Boundary Check: Event 4 at `T0 + 30 min` (`10:30:00`), Page: `/contact` (>15 min gap) -> Closes `S1`, creates `S2` (`pageViews = 1`).
   - Assertions verify that Events 1–3 result in **exactly 1 session** in the database with 3 page views, and Event 4 results in a distinct second session.

### 2.4 Logic for Script 2 (Carrier Adapter Normalization Verification)
1. Requirement: "Executing mock carrier adapter with dummy payload and verifying correct data normalization (active status, premium, birthday, etc.)."
2. **Verification Protocol**:
   - Provide distinct dummy payloads to `AcmeMutualAdapter` and `ApexLifeAdapter`.
   - Assert:
     - Policy Status correctly maps to union type `'active' | 'inactive' | 'lapsed'`.
     - Premium is converted to a clean positive dollar float.
     - Birthday is standardized to ISO format `YYYY-MM-DD` and age is verified.
     - Missed payments object captures count, total past due, and delinquency flags.
     - Coverage amount is converted to standard number.
     - Policy duration (effective date, expiration/renewal date, tenure months) is computed.
     - Boundary / edge-case testing: invalid dates, negative premiums, or unrecognized statuses fall back safely without unhandled exceptions.

---

## 3. Caveats

1. **Database Backend Dualism (PostgreSQL/Supabase vs. Firestore)**:
   - `ORIGINAL_REQUEST.md § R1` mentions storing tracking data in Firestore, while the existing codebase currently uses PostgreSQL (Supabase) with tables `analytics_visitors`, `analytics_sessions`, and `analytics_page_views`.
   - The session tracking architecture must provide an abstract storage adapter interface (`ISessionRepository`) so that session storage can write to either PostgreSQL or Firestore without changing the sessionization logic.
2. **TypeScript Bundler Mode**:
   - `tsconfig.json` uses `"moduleResolution": "bundler"` and `"noEmit": true`. Running `tsc --noEmit` flags missing file extensions on some imports in existing legacy files.
   - Therefore, standalone test scripts should use standard Node ESM (`.mjs`) or Node CJS (`.cjs`), or use `node --experimental-strip-types` for pure `.ts` test scripts.
3. **TCP Socket Sandbox Isolation**:
   - Direct `http.createServer().listen()` followed by `fetch('http://127.0.0.1:...')` triggers `EPERM` in sandbox without `BypassSandbox`.
   - All automated verification scripts must be designed to execute directly in-process against the service/adapter layers, while supporting live HTTP as an optional flag.

---

## 4. Conclusion & Architecture Blueprint

### 4.1 Universal Carrier API Framework Specification

#### A. Data Model: `NormalizedPolicyData` and Required Types
Located at: `/Users/newholland/1234567/services/carrier/types.ts`
```typescript
export type NormalizedPolicyStatus = 'active' | 'inactive' | 'lapsed';

export type PaymentFrequency = 'monthly' | 'quarterly' | 'semi-annual' | 'annual';

export interface MissedPaymentInfo {
  hasMissedPayment: boolean;
  missedCount: number;
  totalAmountDue: number; // in USD
  lastMissedDate?: string; // ISO YYYY-MM-DD
  gracePeriodEndsAt?: string; // ISO YYYY-MM-DD
}

export interface PolicyDurationInfo {
  effectiveDate: string; // ISO YYYY-MM-DD
  expirationDate?: string; // ISO YYYY-MM-DD
  termYears?: number; // e.g. 10, 20, 30
  tenureMonths: number; // months active from effectiveDate to today
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
  clientAge: number; // Computed age in years
  status: NormalizedPolicyStatus;
  rawStatus: string;
  coverageAmount: number; // in USD
  premiumAmount: number; // in USD
  premiumFrequency: PaymentFrequency;
  duration: PolicyDurationInfo;
  missedPayments: MissedPaymentInfo;
  productType: string;
  rawPayload?: Record<string, unknown>;
  syncedAt: string; // ISO timestamp
}
```

#### B. Adapter Interface: `CarrierAdapter`
Located at: `/Users/newholland/1234567/services/carrier/CarrierAdapter.ts`
```typescript
import { NormalizedPolicyData } from './types.js';

export interface CarrierAdapter<TRawPayload = unknown> {
  readonly carrierId: string;
  readonly carrierName: string;

  normalize(rawPayload: TRawPayload): NormalizedPolicyData;
  validatePayload(rawPayload: unknown): rawPayload is TRawPayload;
  calculateAge(birthdayIso: string): number;
}
```

#### C. Carrier 1: `AcmeMutualAdapter` (Legacy Format)
- **Carrier Profile**: Legacy Mutual Life Insurance.
- **Payload Characteristics**: Nested objects, snake_case keys, amounts in integer cents, date formatted as `YYYY/MM/DD`, raw status strings: `"IN_FORCE"`, `"GRACE_PERIOD"`, `"LAPSED"`, `"EXPIRED"`.
- **Sample Raw Payload**:
  ```json
  {
    "carrier_code": "ACME_MUTUAL",
    "contract_id": "ACM-88921-X",
    "insured_party": {
      "full_legal_name": "Eleanor Vance",
      "dob": "1982/06/14",
      "contact_email": "eleanor.vance@example.com"
    },
    "policy_details": {
      "plan_code": "TERM_20_PREMIUM",
      "policy_status": "IN_FORCE",
      "issue_date": "2020/06/01",
      "expiry_date": "2040/06/01",
      "term_years": 20
    },
    "coverage": {
      "face_amount_cents": 50000000
    },
    "billing": {
      "modal_premium_cents": 14500,
      "frequency": "MONTHLY",
      "past_due_installments": 0,
      "past_due_cents": 0
    }
  }
  ```
- **Normalization Mapping**:
  - `status`: `"IN_FORCE"` -> `'active'`, `"GRACE_PERIOD"` -> `'inactive'`, `"LAPSED"` / `"EXPIRED"` -> `'lapsed'`.
  - `clientBirthday`: `"1982/06/14"` -> `"1982-06-14"`.
  - `coverageAmount`: `50000000 / 100` -> `$500,000`.
  - `premiumAmount`: `14500 / 100` -> `$145.00`.
  - `missedPayments`: `past_due_installments: 0` -> `{ hasMissedPayment: false, missedCount: 0, totalAmountDue: 0 }`.

#### D. Carrier 2: `ApexLifeAdapter` (Modern InsurTech Format)
- **Carrier Profile**: Modern API-first InsurTech.
- **Payload Characteristics**: Flattened camelCase keys, decimal float dollar values, ISO 8601 timestamps, raw status strings: `"CURRENT"`, `"PAYMENT_PENDING"`, `"TERMINATED"`, `"CANCELLED"`.
- **Sample Raw Payload**:
  ```json
  {
    "provider": "ApexLife InsurTech",
    "policyId": "APX-2024-9912",
    "customer": {
      "name": "Marcus Holloway",
      "birthDate": "1991-03-29T00:00:00.000Z",
      "email": "marcus.holloway@example.com"
    },
    "state": "PAYMENT_PENDING",
    "planType": "Universal Life Plus",
    "benefitAmount": 750000.00,
    "periodicRate": 215.50,
    "billingSchedule": "monthly",
    "inceptionDate": "2022-01-15T00:00:00.000Z",
    "delinquentPayments": 2,
    "totalPastDue": 431.00,
    "lastPaymentFailureDate": "2026-08-15T00:00:00.000Z"
  }
  ```
- **Normalization Mapping**:
  - `status`: `"CURRENT"` -> `'active'`, `"PAYMENT_PENDING"` -> `'inactive'`, `"TERMINATED"` / `"CANCELLED"` -> `'lapsed'`.
  - `clientBirthday`: `"1991-03-29T00:00:00.000Z"` -> `"1991-03-29"`.
  - `coverageAmount`: `750000.00`.
  - `premiumAmount`: `215.50`.
  - `missedPayments`: `delinquentPayments: 2`, `totalPastDue: 431.00` -> `{ hasMissedPayment: true, missedCount: 2, totalAmountDue: 431.00, lastMissedDate: "2026-08-15" }`.

#### E. Carrier Registry: `CarrierRegistry`
Located at: `/Users/newholland/1234567/services/carrier/CarrierRegistry.ts`
- Provides registry methods:
  - `register(adapter: CarrierAdapter)`
  - `get(carrierId: string): CarrierAdapter | undefined`
  - `normalize(carrierId: string, payload: unknown): NormalizedPolicyData`
  - `listSupported(): { carrierId: string; carrierName: string }[]`

---

### 4.2 Programmatic Verification Scripts Implementation Plan

#### Script 1: 15-Minute Sessionization Verification Script
- **Target File**: `/Users/newholland/1234567/scripts/verify-session-tracking.mjs`
- **NPM Script**: `"test:session": "node scripts/verify-session-tracking.mjs"`
- **Architecture**:
  - Instantiates the `SessionTrackingEngine` (or executes against `/api/analytics/collect`).
  - Generates a unique test `visitorId = "test_vis_" + Date.now()`.
  - Simulates 3 page views within a 15-minute window:
    1. Visit 1: `T0` (10:00:00), Page: `/website/home`
    2. Visit 2: `T0 + 4 mins` (10:04:00), Page: `/website/services`
    3. Visit 3: `T0 + 11 mins` (10:11:00), Page: `/website/insurance-quote`
  - Queries session store / database and verifies:
    - Exactly **1 session** exists for this visitor.
    - Session contains all 3 page views.
    - Session duration is 660 seconds (11 minutes).
    - Session start time matches Visit 1; end time matches Visit 3.
  - Simulates Visit 4 at `T0 + 28 mins` (10:28:00, gap = 17 mins > 15-min window):
    - Verifies that Visit 4 triggers the creation of a **second distinct session**.
    - Verifies total sessions count = 2.
  - Exits with `0` on success, `1` on assertion failure.

#### Script 2: Carrier Adapter Normalization Verification Script
- **Target File**: `/Users/newholland/1234567/scripts/verify-carrier-adapter.mjs`
- **NPM Script**: `"test:carrier": "node scripts/verify-carrier-adapter.mjs"`
- **Architecture**:
  - Imports `AcmeMutualAdapter`, `ApexLifeAdapter`, and `CarrierRegistry`.
  - Test Suite 1: **AcmeMutual Normalization**:
    - Feeds raw legacy payload.
    - Verifies status: `'active'`.
    - Verifies premium: `145` (converted from cents).
    - Verifies birthday: `'1982-06-14'`.
    - Verifies age calculation accurately matches date.
    - Verifies missed payments: `hasMissedPayment === false`, `missedCount === 0`.
    - Verifies coverage amount: `500000`.
    - Verifies duration: effective date, tenure months.
  - Test Suite 2: **ApexLife Normalization**:
    - Feeds raw InsurTech payload with delinquent status.
    - Verifies status: `'inactive'`.
    - Verifies premium: `215.5`.
    - Verifies birthday: `'1991-03-29'`.
    - Verifies missed payments: `hasMissedPayment === true`, `missedCount === 2`, `totalAmountDue === 431`.
    - Verifies coverage amount: `750000`.
  - Test Suite 3: **Boundary and Invalidation Tests**:
    - Lapsed payload maps to `'lapsed'`.
    - Invalid payload schema throws a typed validation error.
  - Exits with `0` on 100% pass, non-zero on failure.

---

### 4.3 Proposed UI Integration in CRM (`pages/crm/Clients.tsx`)
To fulfill the acceptance criterion: *"The CRM UI includes a section that displays this normalized policy data for a client"*:
- Create a reusable component: `/Users/newholland/1234567/components/carrier/NormalizedPolicyCard.tsx`.
- Include the component inside `pages/crm/Clients.tsx` under the client details / edit modal:
  - Add a dedicated **"Carrier Policy Sync"** tab in the client modal.
  - Display:
    - Issuing Carrier badge (Acme Mutual / Apex Life).
    - Status pill with color codes: `active` (emerald), `inactive` (amber), `lapsed` (rose).
    - Coverage Amount badge (e.g. `$500,000 Total Coverage`).
    - Premium and frequency (e.g. `$145.00 / month`).
    - Insured Birthday & Age (e.g. `June 14, 1982 (44 yrs)`).
    - Policy Duration (e.g. `Effective June 1, 2020 • 6 years tenure`).
    - Missed Payment alert banner:
      - Clean status: `All payments current`.
      - Delinquent status: `⚠️ 2 Missed Payments ($431.00 past due) — Grace period ends in 14 days`.
    - "Sync Carrier Data" button triggering dynamic re-fetch/normalization.

---

## 5. Verification Method

To independently verify these findings and execute the recommended infrastructure once implemented:

### 5.1 Verification Commands
1. **Verify Environment & Node.js Test Engine**:
   ```bash
   node -v
   # Must return v24.14.0 or higher
   ```
2. **Verify Carrier Adapter Normalization (Script 2)**:
   ```bash
   node scripts/verify-carrier-adapter.mjs
   # Must exit with code 0 and output: "All Carrier Normalization Tests Passed (100%)"
   ```
3. **Verify 15-Minute Sessionization (Script 1)**:
   ```bash
   node scripts/verify-session-tracking.mjs
   # Must exit with code 0 and output: "Unified Session Verification Passed: 3 visits unified, 1 visit segmented"
   ```
4. **Verify Built-In Test Suite**:
   ```bash
   node --test backend/tests/*.test.cjs
   # Must execute all backend and adapter tests cleanly
   ```

### 5.2 Invalidation Conditions
This architecture recommendation would be invalidated if:
- A new package dependency is introduced that breaks compatibility with Node `v24.14.0` ESM modules.
- The carrier adapter fails to extract any of the mandatory fields (`status`, `premium`, `birthday`, `missedPayments`, `coverage`, `duration`).
- The session tracker fails to merge page views within the 15-minute sliding window into a single session ID.
