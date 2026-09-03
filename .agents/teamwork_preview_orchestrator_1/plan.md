# Orchestration Plan: Phase 1 CRM Technical Audit & SignalWire Telephony Implementation Plan

## Objective
Perform a complete Phase 1 technical audit of the existing CRM codebase and produce a comprehensive SignalWire Telephony Implementation Plan under a strict read-only policy.

## Steps & Verification
1. **Setup & Initialization**:
   - Initialize state, briefing, dispatch, progress, and heartbeat cron.
   - Verify read-only constraints.

2. **Technical Audit Survey (R1)**:
   - Dispatch 3 parallel Explorers:
     - Explorer 1 (Frontend & WebRTC): Inspect frontend framework, structure, components, state management, and any existing WebSocket/WebRTC infrastructure or softphone capabilities.
     - Explorer 2 (Backend & API & Hosting): Inspect backend server/API structure, routes, middleware, services, hosting/deployment config (Docker, Vercel, Supabase, Cloudflare, etc.), environment variables, SignalWire SDK/credentials check.
     - Explorer 3 (Database Schema, Auth, Users & Leads): Inspect database schema (PostgreSQL, Supabase, Prisma, Drizzle, migrations, etc.), authentication flow, agent/user models, leads/contacts data models and relations.
   - Aggregate findings.

3. **Synthesis & Plan Generation (R2)**:
   - Dispatch a Worker to draft `/Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md` covering:
     - Section 1: Executive Summary & System Overview.
     - Section 2: Comprehensive Technical Audit (answering items 1-9 in R1 with exact code citations).
     - Section 3: Telephony Architecture & Standalone Service Design.
     - Section 4: Database Schema Design for Calls, Recordings, Queues, Logs, Agents (referencing existing CRM user/lead tables).
     - Section 5: SignalWire Integration & WebRTC Softphone Architecture (Browser SIP / SignalWire WebRTC SDK / WebSockets / Call Flow).
     - Section 6: CRM Lead Matching & Screen-Pop / Event Flow.
     - Section 7: Step-by-Step Implementation Roadmap (Phases, Milestones, Testing strategy).
     - Section 8: Strict Non-Interference & Risk Analysis (Ensuring zero regressions to CRM).

4. **Review & Forensic Audit (R3 & Acceptance Criteria)**:
   - Dispatch Reviewer 1 & Reviewer 2 to verify audit accuracy, schema correctness, and architectural soundess.
   - Dispatch Forensic Auditor to verify that ZERO CRM source files were modified, only audit/metadata files created.

5. **Finalization & Handoff**:
   - Update GATE_STATUS.md, PROJECT.md, progress.md.
   - Prepare handoff.md and send completion report to parent.
