# BRIEFING — 2026-08-13T08:02:50Z

## Mission
Investigate R4 (Automated Ad Campaign Lead Ingestion) and R5 (Real-Time CRM Lead Qualification Engine) in the New Holland Financial CRM project at /Users/newholland/1234567.

## 🔒 My Identity
- Archetype: Teamwork explorer
- Roles: Lead Ingestion & Qualification Engine Specialist
- Working directory: /Users/newholland/1234567/.agents/survey_explorer_3
- Original parent: ab6b6c78-b037-4e4d-96d7-83bd9d1e98df
- Milestone: Investigation & Analysis Complete

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Analyze API routing setup (Express router at `/api/webhooks`, Vite frontend)
- Check database schema for leads, lead scores, status ("Qualified"/"Disqualified"), campaign source, financial criteria fields (asset volume, income, credit score)
- Investigate webhook endpoints structure (`/api/webhooks/campaigns`)
- Investigate background process/simulator requirements for streaming Meta/Google/TV ad leads
- Investigate real-time notification mechanism to agent panel (WebSockets `/ws`, Supabase Realtime)

## Current Parent
- Conversation ID: ab6b6c78-b037-4e4d-96d7-83bd9d1e98df
- Updated: 2026-08-13T08:02:50Z

## Investigation State
- **Explored paths**: `package.json`, `backend/server.cjs`, `backend/schema.sql`, `backend/supabase_schema.sql`, `backend/routes/webhooks.cjs`, `backend/routes/marketing.cjs`, `backend/services/routingEngine.cjs`, `services/marketingBackend.ts`, `services/socketService.ts`, `types.ts`, `pages/admin/MarketingIntegrations.tsx`, `pages/crm/Leads.tsx`.
- **Key findings**: Express 5.2 backend on port 3001 handles API and WebSockets `/ws`. `leads` schema stores vertical details in JSONB (`life_details`, `securities_details`, `custom_details`). Currently missing explicit `"Qualified"` / `"Disqualified"` status values and unified financial criteria screening (`asset_volume`, `annual_income`, `credit_score`). Missing dedicated `/api/webhooks/campaigns` endpoint, TV ad normalizer, and background simulator process. Real-time notifications supported via Express `broadcast` over `/ws` and Supabase Realtime.
- **Unexplored areas**: None relevant to R4/R5 scope.

## Key Decisions Made
- Fully documented architecture, database schema, endpoint design, qualification rules, background simulator requirements, and real-time WebSocket messaging in `handoff.md`.

## Artifact Index
- `/Users/newholland/1234567/.agents/survey_explorer_3/DISPATCH.md` — Dispatch log
- `/Users/newholland/1234567/.agents/survey_explorer_3/BRIEFING.md` — Working memory
- `/Users/newholland/1234567/.agents/survey_explorer_3/progress.md` — Liveness heartbeat
- `/Users/newholland/1234567/.agents/survey_explorer_3/handoff.md` — Final report
