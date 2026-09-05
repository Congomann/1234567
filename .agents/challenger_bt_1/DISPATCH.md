# Dispatch for Challenger 1 (Behavioral Tracking Adversarial Stress-Testing)

## Mission
Perform empirical adversarial verification and stress testing of the Behavioral Tracking Engine (`backend/services/behavioralTrackingService.cjs`):
1. Write and execute stress tests attacking edge conditions:
   - Millisecond boundary session timeouts: hit at T0, T0 + 14m 59s (must stay same session), then T0 + 30m (must split into new session).
   - High concurrency: rapid simulated hits with identical visitor IDs.
   - Malformed/empty payloads: missing paths, missing IPs, null referrers.
   - Lead identity stitching: anonymous multi-session stitching when lead is converted on the 3rd session.
2. Verify system resilience, absence of unhandled exceptions, and strict state preservation.
3. Issue explicit verdict: APPROVE or REJECT in your handoff report.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read `/Users/newholland/1234567/backend/services/behavioralTrackingService.cjs`.

## Deliverables
- Deliver your adversarial test report to `/Users/newholland/1234567/.agents/challenger_bt_1/handoff.md`.
- Send a completion message with your verdict (APPROVE or REJECT) to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).

## 2026-09-03T12:57:01Z
You are Challenger 1 (challenger_bt_1).
Working directory: /Users/newholland/1234567/.agents/challenger_bt_1
Role: Adversarial Verifier for Behavioral Tracking.

Instructions:
1. Read /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md and /Users/newholland/1234567/.agents/challenger_bt_1/DISPATCH.md FIRST.
2. Perform empirical stress-testing on backend/services/behavioralTrackingService.cjs:
   - Boundary inactivity intervals (e.g. 14m 59s vs 15m 01s).
   - High concurrency / burst visits with identical visitor IDs.
   - Malformed/empty payloads.
   - Anonymous lead conversion and multi-session retroactive stitching.
3. Write your findings to /Users/newholland/1234567/.agents/challenger_bt_1/handoff.md with explicit verdict: APPROVE or REJECT.
4. Send a completion message to parent orchestrator (conversation ID e302f713-1175-43e6-af73-3e1b67df679e).

