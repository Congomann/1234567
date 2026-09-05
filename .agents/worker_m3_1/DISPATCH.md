# Dispatch for Worker M3: CRM Admin UI & Client Views Integration

## Mission
Implement the user-facing CRM UI components for Requirements R1 & R2:
1. **R1 Admin Analytics View** (`pages/admin/AdminAnalytics.tsx` reachable at `/crm/admin/analytics`):
   - Add an interactive User/IP intelligence selector bar with quick-search and tracked entity dropdown.
   - Implement `components/analytics/UserSessionProfileModal.tsx` (or integrated inspector) displaying:
     - 15-minute grouped session history timeline with start/end time, duration, and list of visited pages.
     - Behavioral profile: Intent score gauge (0–100, Hot/Warm/Cold), financial category affinities (life insurance, real estate, etc.), marketing tags, and targeted advertising recommendations (Meta, Google, TV, LinkedIn).
     - Linked CRM lead details if identified.
     - Ensure selecting or providing a simulated user's IP/ID fetches and displays this session history and behavioral profile.
2. **R2 Normalized Client Policy View** (`pages/crm/Clients.tsx` reachable at `/crm/clients`):
   - Add a dedicated "Carrier Policy" tab inside the Client details modal.
   - Implement `components/crm/NormalizedPolicySection.tsx` rendering all 6 normalized policy fields:
     - Policy Status badge (`active` emerald, `inactive` amber, `lapsed` rose).
     - Premium amount and payment frequency ($ / month, $ / year).
     - Total Coverage benefit amount.
     - Insured Client Birthday & calculated Age.
     - Missed Payments alert (clean status vs. delinquent count, total past due, and grace period).
     - Policy Duration (issue date, tenure in months/years, expiration).
     - Carrier badge (Acme Mutual / Apex Life) and an interactive "Sync Carrier Data" button that executes carrier normalization and updates the displayed policy data.
3. Design System Compliance:
   - Use existing Tailwind CSS classes, Apple glassmorphic utilities (`.apple-glass`, `.apple-card`), and Lucide React icons (`Shield`, `Activity`, `Calendar`, `DollarSign`, `AlertTriangle`, `CheckCircle`, `Clock`, `Target`, `TrendingUp`).
   - Validate with `npm run lint` or `npx tsc --noEmit` and `npm run build`.

## Mandatory Inputs & Files to Read
- Read `/Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md` FIRST.
- Read `/Users/newholland/1234567/.agents/teamwork_preview_orchestrator_3/PROJECT.md`.
- Read `/Users/newholland/1234567/.agents/explorer_bt_survey_1/handoff.md` for complete UI blueprints, component layouts, and styling patterns.
- Read `/Users/newholland/1234567/services/carrier/index.ts` to consume the universal carrier framework.
- Read `/Users/newholland/1234567/backend/routes/analytics.cjs` to consume the analytics API endpoints.

## Exclusive Write Ownership
You own:
- `components/analytics/UserSessionProfileModal.tsx`
- `components/crm/NormalizedPolicySection.tsx`
- `pages/admin/AdminAnalytics.tsx`
- `pages/crm/Clients.tsx`
- `services/analyticsService.ts`
- `services/carrier/carrierClientService.ts` (if needed)

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Verification Requirements
- Verify TypeScript types compile cleanly: `npm run lint` or `npx tsc --noEmit`.
- Verify production build succeeds: `npm run build`.
- Verify UI components render correctly and handle user interactions.
- Deliver your handoff report to `/Users/newholland/1234567/.agents/worker_m3_1/handoff.md`.
- Send a completion message to parent orchestrator (`e302f713-1175-43e6-af73-3e1b67df679e`).

## 2026-09-03T09:46:21Z
You are the CRM UI Integration Worker (worker_m3_1).
Working directory: /Users/newholland/1234567/.agents/worker_m3_1
Role: Implement CRM Admin UI & Client Views Integration (Milestone M3).
Reachable in CRM at /crm/admin/analytics and /crm/clients.

