# Original User Request

## Initial Request — 2026-08-15T06:39:17Z

You are the Project Orchestrator for the Phase 1 CRM Technical Audit & SignalWire Telephony Implementation Plan.

Working directory: /Users/newholland/1234567/.agents/teamwork_preview_orchestrator_1
Workspace root: /Users/newholland/1234567
Authoritative request: /Users/newholland/1234567/.agents/ORIGINAL_REQUEST.md
Parent conversation ID: dc59db59-af95-4025-8a70-43c4349aa857

Mission:
Perform a complete Phase 1 audit of the existing CRM to prepare for a standalone call-center/telephony system using SignalWire.
Do not modify any existing CRM code during this phase (Strict Read-Only Policy).

Requirements:
R1. Technical Audit:
Inspect the entire existing application and determine:
1. Current frontend framework and structure.
2. Current backend/API structure.
3. Database schema and authentication.
4. Where users/agents are stored.
5. How leads and contacts are stored.
6. Current hosting/deployment configuration.
7. Existing SignalWire credentials/configuration (and whether the SDK is installed).
8. Existing environment variables related to SignalWire.
9. Whether the application already has WebSocket/WebRTC infrastructure.

R2. Technical Implementation Plan:
Produce a technical implementation plan for adding a standalone call-center/telephony system without breaking the existing CRM. The plan should outline how to cleanly implement a TelephonyService, database schemas for calls, WebRTC softphone integrations, and CRM lead matching.

R3. Strict Read-Only Policy:
You must only read files and write the resulting audit/plan document. Do not change existing authentication, database tables, or business logic. Zero source code files in the CRM may be modified.

Acceptance Criteria:
- The final output is a comprehensive Markdown document containing the findings for all items listed in R1.
- The document includes a proposed architecture and data model for the telephony system that references existing CRM tables.
- Zero source code files in the CRM are modified during this process.

Protocol:
1. Initialize BRIEFING.md, plan.md, and progress.md in your working directory.
2. Decompose the task and dispatch to specialist subagents (explorers, workers, reviewers) to inspect the codebase and synthesize the audit.
3. Produce the comprehensive report (e.g., /Users/newholland/1234567/TELEPHONY_PHASE1_AUDIT_PLAN.md).
4. Review and verify the document against all acceptance criteria and ensure zero CRM source files were changed.
5. Write your handoff.md and send completion message back to parent.

## Follow-up — 2026-09-03T09:29:38Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full build team

Implement an advanced behavioral tracking system for marketing profiling, and build a modular Carrier API integration framework to synchronize client policy data, payments, and lifecycle events.

Working directory: `/Users/newholland/1234567`
Integrity mode: demo

## Requirements

### R1. Behavioral Profiling & Analytics System
Build a tracking mechanism that groups user visits/actions into 15-minute sessions. Store this tracking data in the database (Firestore) so it links seamlessly to existing CRM leads. Create an admin view in the CRM where administrators can select a user/IP to view their session history, visited pages, and behavioral profile to guide targeted advertising.

### R2. Modular Carrier API Framework
Develop a plug-and-play Carrier API system in the CRM. Build a universal interface/framework and include 1-2 mocked example carriers. The system must track and display client policies, missed payments, birthdays, policy status (active/inactive/lapsed), coverage/premium amounts, and policy duration.

## Acceptance Criteria

### Behavioral Analytics
- [ ] A programmatic test or script simulates a user visiting 3 different pages within a 15-minute window and successfully stores it as a unified session in the database.
- [ ] The CRM includes a reachable admin UI component that fetches and displays this session history and behavioral profile when provided with the simulated user's IP/ID.

### Carrier Integrations
- [ ] The codebase contains a universal TypeScript interface/adapter for carriers.
- [ ] A programmatic test or script executes the mock carrier adapter with a dummy API payload, and the adapter correctly normalizes the data (extracting active status, premium, and birthday).
- [ ] The CRM UI includes a section that displays this normalized policy data for a client.
