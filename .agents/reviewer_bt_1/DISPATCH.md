# Dispatch for Reviewer 1 (Behavioral Tracking & Admin UI)

## Mission
Independently review Requirement R1 implementation:
1. Behavioral Tracking Engine (`backend/services/behavioralTrackingService.cjs`) and routes (`backend/routes/analytics.cjs`).
2. Verify the 15-minute sliding inactivity window grouping logic and boundary segmentation.
3. Verify Firestore document storage (`sessions`, `behavioral_profiles`) and CRM lead identity resolution.
4. Verify Admin Analytics view (`pages/admin/AdminAnalytics.tsx` and `components/analytics/UserSessionProfileModal.tsx`) reachable at `/crm/admin/analytics`.
5. Run verification tests:
   - `node scripts/verify-session-tracking.mjs`
   - `node --test backend/tests/behavioral_tracking.test.cjs`
   - `npm run build`
6. Issue explicit verdict: APPROVE or REQUEST_CHANGES in your handoff report.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read worker handoffs: `.agents/worker_m1_1/handoff.md` and `.agents/worker_m3_2/handoff.md`.

## Deliverables
- Deliver your review report to `/Users/newholland/1234567/.agents/reviewer_bt_1/handoff.md`.
- Send a completion message with your verdict (APPROVE or REQUEST_CHANGES) to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).

## 2026-09-03T12:57:00Z
You are Reviewer 1 (reviewer_bt_1).
Working directory: /Users/newholland/1234567/.agents/reviewer_bt_1
Role: Reviewer for Requirement R1 (Behavioral Tracking & Admin UI).

Instructions:
1. Read /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md and /Users/newholland/1234567/.agents/reviewer_bt_1/DISPATCH.md FIRST.
2. Read /Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md.
3. Review backend/services/behavioralTrackingService.cjs, backend/routes/analytics.cjs, pages/admin/AdminAnalytics.tsx, and components/analytics/UserSessionProfileModal.tsx.
4. Verify sliding window logic (15 mins), session persistence in Firestore, and Admin UI session/profile inspector.
5. Run verification commands:
   - node scripts/verify-session-tracking.mjs
   - node --test backend/tests/behavioral_tracking.test.cjs
   - npm run build
6. Write your comprehensive review report to /Users/newholland/1234567/.agents/reviewer_bt_1/handoff.md with explicit verdict: APPROVE or REQUEST_CHANGES.
7. Send a completion message to parent orchestrator (conversation ID e302f713-1175-43e6-af73-3e1b67df679e).

