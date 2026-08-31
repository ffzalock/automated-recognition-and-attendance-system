# T1-T20 Change Document: Unique Check-in Display

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | CHG-UNIQUE-CHECKIN |
| Module | accounts / cctv |
| Date | 2026-07-17 |
| Owner / Agent | Frontend / Release/Ops |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-07-17-unique-checkin-display.md` |

## T2 Requirement

- User request:
  - Add a separate column/row that uniquely displays the names of students who have checked in today.
  - Currently, names appear multiple times in the real-time log. The new card should list each student exactly once.
- Business goal: Allow administrators/staff to quickly see the exact list of present students today without duplicate entries.
- Success outcome: Two panels exist: (1) Real-time check-in log, (2) Today's unique check-ins list showing student names in green.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Backend route truth | `backend-node/server/routes/app.routes.js` | Routes verified |
| Frontend route | `frontend-vue/src/router/index.js` | Pages verified |
| Frontend API | `frontend-vue/src/service/api.js` | Attendance client endpoints verified |
| PRD/docs | `docs/prd/PRD-automated-recognition-and-attendance-system.md` | Check-in functional requirements verified |

## T4 Current Behavior

- Current API behavior: Returns check-in history sorted chronologically.
- Current UI behavior: Shows list of recent check-ins; duplicate check-ins result in duplicate name rows in the log panel.

## T5 Impacted Agents

| Agent | Required? | Reason |
|---|---|---|
| Orchestrator | yes | Standard orchestration |
| Frontend | yes | Implement list rendering, CSS styles, and computed uniqueness logic |
| Release/Ops | yes | Re-build and deploy containers |

## T6 Scope

In scope:
- Filter check-in history to present today's unique check-ins only.
- Render today's unique check-ins card in `CheckIn.vue` and `CctvViewer.vue`.
- Style unique check-ins indices and text with green (`text-success`).
- Increase history load limit from 20 to 200 to ensure today's records are captured fully.

Out of scope:
- Creating new backend API routes (handled on frontend client-side dynamically).

## T7 Functional Requirements

| FR ID | Requirement | Actor | Priority |
|---|---|---|---|
| FR-UNIQUE-001 | Dynamic computed unique checklist filter | Frontend | Must |
| FR-UNIQUE-002 | Side-by-side card layouts for logs vs uniques | Frontend | Must |

## T8 Acceptance Criteria

| AC ID | FR ID | Given | When | Then |
|---|---|---|---|---|
| AC-UNIQUE-001 | FR-UNIQUE-001 | The history has multiple records of student "A" today | The computed unique property loads | Student "A" is only listed once in the unique display |
| AC-UNIQUE-002 | FR-UNIQUE-002 | A student checks in | The system loads the panels | The real-time log lists all logs chronologically; the unique card lists the student in green |

## T10 Data Model / Migration

No database migration or schema changes required.

## T12 Frontend Plan / Changes

- CheckIn.vue:
  - Add `todayUniqueCheckIns` computed method.
  - Insert new UI card element alongside the Real-time log panel.
  - Add `.unique-list-container` and `.unique-index` styles.
- CctvViewer.vue:
  - Add `todayUniqueCheckIns` computed method.
  - Replicate template layout structure with green CSS rules.

## T15 Implementation Summary

| File | Change |
|---|---|
| `frontend-vue/src/projects/views/accounts/CheckIn.vue` | Added unique check-in display component, styling, computed logic, and increased history loading limit. |
| `frontend-vue/src/projects/views/accounts/CctvViewer.vue` | Replicated unique check-in card, styles, computed logic, and history limits. |

## T16 Tests Run / Evidence

| Command | Result | Evidence / Notes |
|---|---|---|
| `docker compose build frontend backend` | pass | Docker images compiled with zero lint/build issues. |
| `docker compose up -d --force-recreate` | pass | Containers up and healthy. |

## T17 PRD / Docs Updated

| Document | Updated? | Reason |
|---|---|---|
| `docs/prd/PRD-automated-recognition-and-attendance-system.md` | yes | Document control, functional baselines updated |
| `docs/tasks/tasklist-progress.md` | yes | System readiness dashboard updated |

## T20 Final Handoff

```txt
Feature: Unique Check-in Display
Status: Done
Active tasklist: docs/tasks/2026-07-17-unique-checkin-display.md
Task IDs: automated-recognition-and-attendance-system-TASK-001 to TASK-006
Progress: 95%
Changed files: CheckIn.vue, CctvViewer.vue
Routes: /accounts/directory/check-in, /directory/cctv/viewer
Permission: /accounts/directory
Data migration: None
Tests run: Docker build and recreate containers pass
PRD/docs: PRD updated, tasklist progress updated and re-rendered
Open risks: Local CCTV python env issue
Next owner: User UAT check
```
