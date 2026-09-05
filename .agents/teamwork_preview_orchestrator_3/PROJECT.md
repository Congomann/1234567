# Project: Behavioral Tracking & Carrier API Framework

## Architecture
- **Frontend**: Vite 6 + React 18 SPA (`react-router-dom` v6). Uses Tailwind CSS CDN with custom Apple glassmorphic classes (`.apple-glass`, `.apple-card`, `.apple-3d-card`) and Lucide React icons.
  - Route `/crm/admin/analytics`: Enhanced with `UserSessionProfileModal` & `BehavioralProfileInspector` for user/IP selection, 15-minute grouped session histories, visited pages, intent scores, and targeted marketing ad recommendations.
  - Route `/crm/clients`: Enhanced with `NormalizedPolicySection` within the client details modal displaying normalized carrier status, premium, coverage, birthday/age, missed payment alerts, and duration.
- **Backend & Database**: Express 5 server (`backend/server.cjs`) with `BehavioralTrackingService`.
  - **15-Minute Session Engine**: Sliding inactivity window (900 seconds) grouping page visits into single unified sessions and partitioning when inactivity exceeds 15 minutes.
  - **Storage Architecture**: Dual-layer storage supporting Firestore collections (`sessions`, `behavioral_profiles`) via an intelligent store adapter (with high-fidelity in-memory emulator fallback when Google Cloud credentials are not configured in demo mode) and cross-referencing PostgreSQL `leads`.
  - **Carrier API Framework**: Universal TypeScript interface (`CarrierAdapter`), `NormalizedPolicyData`, and `CarrierRegistry` in `services/carrier/` with 2 mock carrier implementations (`AcmeMutualAdapter` and `ApexLifeAdapter`).
  - **Programmatic Test Scripts**: Native `node:test` execution scripts (`scripts/verify-session-tracking.mjs` and `scripts/verify-carrier-adapter.mjs`).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | 15-Minute Sliding Window Sessionization | Ingestion engine grouping visits within 15 mins into unified session and splitting on >15m inactivity | M1 | explorer_bt_survey_2 |
| 2 | Firestore Session & Profile Storage | Structured Firestore document storage for sessions and behavioral profiles with demo fallback | M1 | explorer_bt_survey_2 |
| 3 | CRM Lead Identity Resolution | Auto-linking tracking sessions to CRM leads by leadId, email, phone, IP, or visitorId | M1 | explorer_bt_survey_2 |
| 4 | Behavioral Tracking API Endpoints | REST endpoints `/api/analytics/track`, `/api/analytics/sessions/query`, `/api/analytics/profiles/:id` | M1 | explorer_bt_survey_2 |
| 5 | Universal Carrier Interface & Types | Universal TypeScript types `CarrierAdapter<TRaw>`, `NormalizedPolicyData`, `CarrierRegistry` | M2 | explorer_bt_survey_3 |
| 6 | Mock Carrier 1: AcmeMutual Adapter | Adapter normalizing legacy snake_case, integer cents, and DOB format to normalized policy schema | M2 | explorer_bt_survey_3 |
| 7 | Mock Carrier 2: ApexLife Adapter | Adapter normalizing modern InsurTech camelCase, decimal floats, ISO timestamps, and delinquent payments | M2 | explorer_bt_survey_3 |
| 8 | Carrier Registry & Normalization Service | Plug-and-play carrier registry managing carrier adapters and dispatching payload normalization | M2 | explorer_bt_survey_3 |
| 9 | CRM Admin Analytics Behavioral Inspector UI | Reachable admin UI at `/crm/admin/analytics` to select user/IP and view 15-min sessions & ad profile | M3 | explorer_bt_survey_1 |
| 10| CRM Client Normalized Policy Section UI | Dedicated UI section in `/crm/clients` modal rendering normalized policy details & sync button | M3 | explorer_bt_survey_1 |
| 11| Programmatic Test: 15-Min Session Verification | Automated test script simulating 3 visits within 15 min, verifying unified session storage in DB | M4 | explorer_bt_survey_3 |
| 12| Programmatic Test: Carrier Normalization | Automated test script executing mock carriers with dummy payloads, verifying normalized fields | M4 | explorer_bt_survey_3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Behavioral Tracking Engine & Firestore Storage | Features 1, 2, 3, 4: 15-min sliding window engine, Firestore storage adapter, lead resolution, REST endpoints | none | DONE |
| M2 | Modular Carrier API Framework & Adapters | Features 5, 6, 7, 8: Universal carrier interface, AcmeMutual & ApexLife adapters, CarrierRegistry | none | DONE |
| M3 | CRM Admin UI & Client Views Integration | Features 9, 10: Admin user/IP session & profile inspector, Client modal normalized policy section | M1, M2 | DONE |
| M4 | Programmatic Verification & Test Suite | Features 11, 12: `verify-session-tracking.mjs`, `verify-carrier-adapter.mjs`, backend node:test suite | M1, M2, M3 | DONE |
| M5 | Multi-Agent Review, Challenger & Forensic Audit Gate | Comprehensive verification by 2 Reviewers, 2 Challengers, and 1 Forensic Auditor | M4 | DONE |

## Interface Contracts
### 1. Behavioral Tracking Ingestion Contract
- **Endpoint**: `POST /api/analytics/track`
- **Request Body**:
  ```json
  {
    "visitorId": "vis_string",
    "sessionId": "sess_optional",
    "ip": "string",
    "path": "/products/life",
    "title": "Life Insurance",
    "metadata": {},
    "leadInfo": { "email": "user@example.com", "phone": "+15551234567" }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "sessionId": "sess_1772592000000_a1b2c3d4",
    "isNewSession": boolean,
    "sessionDuration": number,
    "pageCount": number,
    "leadLinked": boolean,
    "leadId": "uuid-or-null"
  }
  ```

### 2. Universal Carrier Normalization Contract
- **Normalized Schema (`NormalizedPolicyData`)**:
  ```typescript
  export interface NormalizedPolicyData {
    carrierId: string;
    carrierName: string;
    policyNumber: string;
    clientName: string;
    clientEmail?: string;
    clientBirthday: string; // ISO YYYY-MM-DD
    clientAge: number;
    status: 'active' | 'inactive' | 'lapsed';
    rawStatus: string;
    coverageAmount: number; // in USD
    premiumAmount: number; // in USD
    premiumFrequency: 'monthly' | 'quarterly' | 'semi-annual' | 'annual';
    duration: {
      effectiveDate: string;
      expirationDate?: string;
      termYears?: number;
      tenureMonths: number;
      isRenewable: boolean;
    };
    missedPayments: {
      hasMissedPayment: boolean;
      missedCount: number;
      totalAmountDue: number;
      lastMissedDate?: string;
      gracePeriodEndsAt?: string;
    };
    productType: string;
    syncedAt: string;
  }
  ```

## Code Layout
- `backend/services/behavioralTrackingService.cjs`: 15-minute sliding window sessionization, Firestore document store, lead linking.
- `backend/routes/analytics.cjs`: Analytics endpoints mounted on Express (`/api/analytics/track`, `/api/analytics/sessions/query`, `/api/analytics/profiles/:identifier`).
- `services/carrier/types.ts`: Universal TypeScript definitions for policies, carriers, and normalization.
- `services/carrier/CarrierAdapter.ts`: Universal CarrierAdapter interface.
- `services/carrier/adapters/AcmeMutualAdapter.ts`: Legacy format adapter implementation.
- `services/carrier/adapters/ApexLifeAdapter.ts`: Modern InsurTech adapter implementation.
- `services/carrier/CarrierRegistry.ts`: Plug-and-play adapter registration and execution registry.
- `components/analytics/UserSessionProfileModal.tsx`: Admin session history & behavioral ad profile modal.
- `components/crm/NormalizedPolicySection.tsx`: Reusable normalized client policy view with carrier sync.
- `pages/admin/AdminAnalytics.tsx`: Enhanced CRM admin analytics view.
- `pages/crm/Clients.tsx`: Enhanced CRM client management view with carrier tab.
- `scripts/verify-session-tracking.mjs`: Programmatic verification for R1 (3 page visits in 15 mins).
- `scripts/verify-carrier-adapter.mjs`: Programmatic verification for R2 (carrier adapter normalization).
- `backend/tests/behavioral_tracking.test.cjs`: Native node:test suite for behavioral tracking.
- `backend/tests/carrier_framework.test.cjs`: Native node:test suite for carrier framework.
