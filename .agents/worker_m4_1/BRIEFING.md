# BRIEFING — 2026-08-13T13:06:45Z

## Mission
Implement Milestone 4: Ad Campaign Ingestion & Simulator (R4.1 & R4.2).

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: /Users/newholland/1234567/.agents/worker_m4_1
- Original parent: 10ab2975-0b1b-4ea2-9b9b-30279cfaafef
- Milestone: Milestone 4 (Ad Campaign Ingestion & Simulator)

## 🔒 Key Constraints
- Exclusive write ownership: `backend/routes/webhooks.cjs`, `backend/scripts/adSimulator.cjs`, `backend/server.cjs`.
- Genuine implementation required (NO hardcoding test results, NO dummy/facade implementations).
- Must expose `POST /api/webhooks/campaigns` in `backend/routes/webhooks.cjs`.
- Must create `backend/scripts/adSimulator.cjs` (dual-mode CLI and module exports `startSimulator`/`stopSimulator`).
- Must integrate autostart in `backend/server.cjs` under `server.listen()`.
- Must document all commands, terminal outputs, build results, and test logs in `handoff.md`.

## Current Parent
- Conversation ID: 10ab2975-0b1b-4ea2-9b9b-30279cfaafef
- Updated: 2026-08-13T13:06:45Z

## Task Summary
- **What to build**: Webhook endpoint `POST /api/webhooks/campaigns` in `backend/routes/webhooks.cjs`, automated ad lead simulator in `backend/scripts/adSimulator.cjs`, and autostart integration in `backend/server.cjs`.
- **Success criteria**:
  - Webhook accepts Meta, Google, and TV ad lead payloads.
  - Inserts lead record into database/in-memory store with `channel`, `campaign_id`, contact info, and financial metrics in `custom_details`.
  - Webhook returns `{ success: true, lead_id: uuid, status: 'received' }`.
  - Simulator streaming mock leads at configurable/default 8s intervals with round-robin or random rotation over Meta, Google, TV channels.
  - Simulator supports `--once` single ping and CLI daemon modes, plus `startSimulator`/`stopSimulator` exports.
  - `server.cjs` autostarts simulator under `server.listen()` when `process.env.ENABLE_AD_SIMULATOR !== 'false'`, with SIGINT/SIGTERM handlers.
- **Interface contracts**: PROJECT.md & SCOPE.md Webhook Payload Contract (M4 ↔ M5).

## Key Decisions Made
- Use Supabase `supabase.from('leads').insert(...)` with fallback handling if Supabase client errors or returns empty data, returning genuine UUID for `lead_id`.
- Use native `fetch` in `adSimulator.cjs` to stream JSON payloads to `POST /api/webhooks/campaigns`.

## Artifact Index
- `/Users/newholland/1234567/.agents/worker_m4_1/DISPATCH.md` — Original task assignment from orchestrator parent.
- `/Users/newholland/1234567/.agents/worker_m4_1/progress.md` — Progress tracker and heartbeat log.
- `/Users/newholland/1234567/.agents/worker_m4_1/BRIEFING.md` — Persistent working memory index.

## Change Tracker
- **Files modified**: None yet.
- **Build status**: Pending implementation.
- **Pending issues**: None.

## Quality Status
- **Build/test result**: Not yet executed.
- **Lint status**: Clean.
- **Tests added/modified**: Pending.

## Loaded Skills
- None loaded.
