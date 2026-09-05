# Dispatch for Forensic Auditor (Integrity Forensics)

## Mission
Perform an independent forensic integrity audit on all implementations across Milestones M1, M2, M3, and M4:
1. Static analysis: Check for hardcoded test inputs/outputs, fake facade methods, dummy returns, or cheated assertions.
2. Runtime analysis: Verify genuine mathematical algorithms for:
   - 15-minute sliding inactivity window calculation (`900,000 ms`).
   - Client age calculation from birthday string.
   - Client tenure months from effective date string.
   - Currency normalization from cents to USD dollars.
   - 0–100 behavioral intent scoring and category affinity distribution.
3. Verify authentic Firestore document operations (real collection/doc storage, not static mocks).
4. Run verification commands:
   - `node scripts/verify-session-tracking.mjs`
   - `node scripts/verify-carrier-adapter.mjs`
   - `node --test backend/tests/*.test.cjs`
   - `npm run build`
5. Issue binary verdict: CLEAN or INTEGRITY VIOLATION in your handoff report.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Inspect all implemented source files:
  - `backend/services/behavioralTrackingService.cjs`
  - `backend/routes/analytics.cjs`
  - `services/carrier/`
  - `components/analytics/UserSessionProfileModal.tsx`
  - `components/crm/NormalizedPolicySection.tsx`
  - `pages/admin/AdminAnalytics.tsx`
  - `pages/crm/Clients.tsx`
  - `scripts/verify-session-tracking.mjs`
  - `scripts/verify-carrier-adapter.mjs`

## 2026-09-03T12:57:01Z - Initial Dispatch
You are the Forensic Integrity Auditor (auditor_bt_1).
Working directory: /Users/newholland/1234567/.agents/auditor_bt_1
Role: Forensic Integrity Auditor.

Instructions:
1. Read /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md and /Users/newholland/1234567/.agents/auditor_bt_1/DISPATCH.md FIRST.
2. Perform forensic integrity checks on all implementations:
   - Check for hardcoded test results, facade methods, dummy returns, or cheated assertions.
   - Verify genuine algorithms for 15-min sliding window sessionization, age/tenure calculation, currency conversion, intent scoring, and Firestore document storage.
3. Run verification commands:
   - node scripts/verify-session-tracking.mjs
   - node scripts/verify-carrier-adapter.mjs
   - node --test backend/tests/*.test.cjs
   - npm run build
4. Write your comprehensive audit report to /Users/newholland/1234567/.agents/auditor_bt_1/handoff.md with binary verdict: CLEAN or INTEGRITY VIOLATION.
5. Send a completion message to parent orchestrator (conversation ID e302f713-1175-43e6-af73-3e1b67df679e).

