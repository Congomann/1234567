# Dispatch for Test Writer (Milestone M4: Programmatic Verification Scripts)

## Mission
Implement the two required programmatic test scripts and E2E acceptance test suite:
1. **Script 1**: `/Users/newholland/1234567/scripts/verify-session-tracking.mjs`:
   - Simulates a user visiting 3 different pages within a 15-minute window (e.g. T0, T0+4m, T0+11m).
   - Verifies that these 3 visits are successfully grouped and stored as a single unified session in the database (Firestore document store).
   - Verifies session fields: 1 unified sessionId, pageCount = 3, duration = 11 minutes (660 seconds), start time matches Visit 1, end time matches Visit 3.
   - Includes boundary check: 4th visit at T0+28m (>15 min gap) correctly closes the first session and creates a distinct second session.
   - Exits with code 0 on pass, non-zero on failure.
2. **Script 2**: `/Users/newholland/1234567/scripts/verify-carrier-adapter.mjs`:
   - Executes the mock carrier adapters (`AcmeMutualAdapter` and `ApexLifeAdapter`) with dummy API payloads.
   - Verifies that both adapters correctly normalize data:
     - Extracts active status ('active' | 'inactive' | 'lapsed').
     - Extracts and normalizes premium amount ($ dollars).
     - Extracts client birthday and calculates client age.
     - Extracts coverage benefit amount.
     - Extracts missed payments (count, amount due, grace period).
     - Extracts policy duration (effective date, tenure months, expiration).
   - Verifies plug-and-play CarrierRegistry lookup and normalization dispatch.
   - Exits with code 0 on pass, non-zero on failure.
3. Update `package.json` with scripts:
   - `"test:session": "node scripts/verify-session-tracking.mjs"`
   - `"test:carrier": "node scripts/verify-carrier-adapter.mjs"`
   - `"test:all": "node --test backend/tests/*.test.cjs && node scripts/verify-session-tracking.mjs && node scripts/verify-carrier-adapter.mjs"`
4. Execute both scripts and the full test suite to ensure all tests exit with code 0.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read `/Users/newholland/1234567/.agents/explorer_bt_survey_3/handoff.md` for exact script specifications.
- Read `/Users/newholland/1234567/services/carrier/index.ts` and `/Users/newholland/1234567/backend/services/behavioralTrackingService.cjs`.

## Exclusive Write Ownership
You own:
- `scripts/verify-session-tracking.mjs`
- `scripts/verify-carrier-adapter.mjs`
- `package.json` (adding npm test scripts)

DO NOT edit frontend UI files or backend core services.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Verification Requirements
- Execute `node scripts/verify-session-tracking.mjs` (must pass and exit 0).
- Execute `node scripts/verify-carrier-adapter.mjs` (must pass and exit 0).
- Execute `npm run test:all` or `node --test backend/tests/*.test.cjs` (all pass).
- Deliver your handoff report to `/Users/newholland/1234567/.agents/test_writer_m4/handoff.md`.
- Send a completion message to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).
