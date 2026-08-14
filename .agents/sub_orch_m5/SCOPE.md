# Scope: Milestone 5 - Real-Time Qualification Engine & Panel

## Architecture
- Lead screening logic in backend (`backend/services/qualificationEngine.cjs`, `backend/routes/marketing.cjs`)
- Database tagging ("Qualified" / "Disqualified")
- WebSocket broadcasting (`LEAD_QUALIFIED`) over `/ws` (`backend/server.cjs`, `services/socketService.ts`)

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| R5.1 | Lead Screening & DB Tagging | Screen incoming leads by financial criteria (asset volume, income, credit score), tag "Qualified"/"Disqualified" in DB | M5 | ORIGINAL_REQUEST.md / PROJECT.md |
| R5.2 | Real-Time Agent Panel Notifications | Emit WebSocket events (`LEAD_QUALIFIED`) on `/ws` to update agent panel UI instantly upon qualification | M5 | ORIGINAL_REQUEST.md / PROJECT.md |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M5 | Real-Time Qualification Engine & Panel | R5.1 Lead Screening & DB Tagging, R5.2 Real-Time Agent Panel Notifications | M1-M4 | IN_PROGRESS |

## Code Paths
- `backend/routes/marketing.cjs`
- `backend/services/qualificationEngine.cjs`
- `backend/server.cjs`
- `services/socketService.ts`
