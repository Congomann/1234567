# Dispatch for Challenger 2 (Carrier Framework Adversarial Stress-Testing)

## Mission
Perform empirical adversarial verification and stress testing of the Modular Carrier API Framework (`services/carrier/`):
1. Write and execute stress tests attacking edge conditions:
   - Corrupted or partial payloads: missing coverage, non-numeric strings, negative amounts.
   - Extreme dates & ages: centenary clients (born in 1920), infants (born in 2026), leap year birthdays (Feb 29).
   - Unrecognized statuses: bizarre raw carrier statuses falling back gracefully.
   - CarrierRegistry abuse: case permutations, unregistered carriers, concurrent dynamic registration.
2. Verify adapter validation throws typed/clean errors without unhandled crashes.
3. Issue explicit verdict: APPROVE or REJECT in your handoff report.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read `/Users/newholland/1234567/services/carrier/index.ts`.

## Deliverables
- Deliver your adversarial test report to `/Users/newholland/1234567/.agents/challenger_bt_2/handoff.md`.
- Send a completion message with your verdict (APPROVE or REJECT) to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).

## 2026-09-03T12:57:01Z
You are Challenger 2 (challenger_bt_2).
Working directory: /Users/newholland/1234567/.agents/challenger_bt_2
Role: Adversarial Verifier for Carrier Framework.

Instructions:
1. Read /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md and /Users/newholland/1234567/.agents/challenger_bt_2/DISPATCH.md FIRST.
2. Perform empirical stress-testing on services/carrier/index.ts:
   - Malformed, partial, or corrupted payloads.
   - Extreme ages, centenary clients, leap year dates.
   - Unknown carrier codes and unhandled raw statuses.
   - Registry lookup abuse and dynamic registration under stress.
3. Write your findings to /Users/newholland/1234567/.agents/challenger_bt_2/handoff.md with explicit verdict: APPROVE or REJECT.
4. Send a completion message to parent orchestrator (conversation ID e302f713-1175-43e6-af73-3e1b67df679e).

