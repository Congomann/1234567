# Dispatch for Worker M1: Behavioral Tracking Engine & Firestore Session Management

## Mission
Implement Requirement R1 backend engine:
1. 15-minute sliding inactivity window sessionization.
2. Firestore storage adapter (`sessions` and `behavioral_profiles` collections) with in-memory fallback for demo mode without GCP credentials.
3. CRM lead identity resolution (linking sessions to leads by leadId, email, phone, IP, or visitorId).
4. REST API endpoints mounted on Express (`POST /api/analytics/track`, `GET /api/analytics/sessions/query`, `GET /api/analytics/profiles/:identifier`, `GET /api/admin/analytics/tracked-entities`).
5. Unit test `backend/tests/behavioral_tracking.test.cjs` demonstrating 3 visits in 15-minute window stored as unified session and 4th visit at >15 min splitting into new session.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read `/Users/newholland/1234567/.agents/explorer_bt_survey_2/handoff.md` for the exact code architecture, data models, and algorithms.

## Exclusive Write Ownership
You own:
- `backend/services/behavioralTrackingService.cjs`
- `backend/routes/analytics.cjs`
- `backend/server.cjs` (only for mounting analyticsRouter)
- `backend/tests/behavioral_tracking.test.cjs`

DO NOT edit any files in `services/carrier/` or `pages/crm/Clients.tsx` (owned by other workers).

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Verification Requirements
- Execute your unit test: `node --test backend/tests/behavioral_tracking.test.cjs`.
- Document all test runs and results in your handoff report.
- Deliver your handoff report to `/Users/newholland/1234567/.agents/worker_m1_1/handoff.md`.
- Send a completion message to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).

## 2026-09-03T09:38:56Z
You are the Behavioral Tracking Backend Worker (worker_m1_1).
Working directory: /Users/newholland/1234567/.agents/worker_m1_1
Role: Implement Behavioral Tracking Engine & Firestore Session Management (Milestone M1).

Instructions:
1. Read /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md and /Users/newholland/1234567/.agents/worker_m1_1/DISPATCH.md FIRST.
2. Read /Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md and /Users/newholland/1234567/.agents/explorer_bt_survey_2/handoff.md for complete technical design, schemas, and algorithms.
3. Implement backend/services/behavioralTrackingService.cjs:
   - 15-minute sliding inactivity window (900,000 ms) grouping visits into sessions.
   - Cryptographic session ID generation (sess_${timestamp}_${hex}).
   - Inactivity timeout logic (finalizing stale sessions, creating fresh sessions if gap >15 min).
   - In-memory Firestore document emulator/store fallback for demo mode, supporting collections 'sessions' and 'behavioral_profiles', with lead linking.
   - Lead identity resolution linking sessions by leadId, email, phone, IP, or visitorId.
   - Behavioral profiling: calculate intent score (0-100), category affinity (life-insurance, real-estate, etc.), marketing tags, and targeted ad recommendations.
4. Implement backend/routes/analytics.cjs and mount in backend/server.cjs:
   - POST /api/analytics/track
   - GET /api/analytics/sessions/query
   - GET /api/analytics/profiles/:identifier
   - GET /api/admin/analytics/tracked-entities
5. Write and execute test backend/tests/behavioral_tracking.test.cjs verifying:
   - 3 visits within 15 min grouped into 1 unified session.
   - 4th visit at 20 min creates a new session.
   - Lead matching and profile query by IP and user ID.
   Run verification: node --test backend/tests/behavioral_tracking.test.cjs
6. Mandatory Warning: DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results.
7. Deliver comprehensive handoff report to /Users/newholland/1234567/.agents/worker_m1_1/handoff.md and send completion message to parent orchestrator (conversation ID e302f713-1175-43e6-af73-3e1b67df679e).

