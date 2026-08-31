# Tasklist: Unique Check-in Display Feature

| Field | Value |
|---|---|
| Date | 2026-07-17 |
| Project | AUTOMATED RECOGNITION ATTENDANCE SYSTEM ATTENDANCE SYSTEM |
| Module / Feature | Unique Check-in Display |
| Requirement | Add a panel showing students who checked in today uniquely (only once per student, colored green) |
| Source Request | User request: "ไม่ใช่แบบนี้ ผมอยากให้เพิ่ม อีกแถวหนึ่งขึ้นมาแล้วแถวนั้นจะแสดงชื่อ ของคนที่เช็คชื่อวันนี้ ทีละคนละชื่อ เพราะตอนนี้มันเช็คแบบเรียวทามใช่ไหม ถ้าเช็คซ้ำๆมัน ขึ้นชื่อเดิม หลายรอบ ผมอยากให้เพิ่มอีกแถวโดยเฉพาะ" |
| Active Change Record | `docs/changes/2026-07-17-unique-checkin-display.md` |
| Status | done |
| Overall Progress | 95% |
| Progress Type | Evidence-backed delivery progress, not estimate |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Workflow | `docs/AI-WORKFLOW.md` | General guidelines followed |
| Docs control index | `docs/AI-DOCS-INDEX.md` | Checked paths |
| Tasklist guide | `docs/tasks/README.md` | Checked formatting rules |
| PRD | `docs/prd/PRD-automated-recognition-and-attendance-system.md` | Checked core check-in feature specification |
| Backend route truth | `backend-node/server/routes/app.routes.js` | Checked routing |
| Frontend route truth | `frontend-vue/src/router/index.js` | Checked page routes |
| Frontend API wrapper | `frontend-vue/src/service/api.js` | Checked attendance API endpoints |
| Privacy / PDPA | n/a | Displayed data is already authorized |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| automated-recognition-and-attendance-system-TASK-001 | Source discovery | Orchestrator | AI | none | done | 100 | Read CheckIn.vue & CctvViewer.vue | `CheckIn.vue`, `CctvViewer.vue` | n/a | none | complete | UI map |
| automated-recognition-and-attendance-system-TASK-002 | Design computed list for unique check-ins | Frontend | AI | TASK-001 | done | 100 | Implemented `todayUniqueCheckIns` filtering today's entries uniquely | `CheckIn.vue` (computed) | n/a | none | complete | Computed property |
| automated-recognition-and-attendance-system-TASK-003 | Update CheckIn.vue UI | Frontend | AI | TASK-002 | done | 100 | Added the new card template + CSS styling class | `CheckIn.vue` (template/style) | Docker build pass | none | complete | UI component |
| automated-recognition-and-attendance-system-TASK-004 | Update CctvViewer.vue UI | Frontend | AI | TASK-002 | done | 100 | Replicated computed logic and template addition | `CctvViewer.vue` | Docker build pass | none | complete | UI component |
| automated-recognition-and-attendance-system-TASK-005 | Increase loadHistory limit & rawDate | Backend/Frontend | AI | TASK-001 | done | 100 | Increased history limit to 200, added rawDate attribute | `CheckIn.vue`, `CctvViewer.vue` | Docker build pass | none | complete | Updated methods |
| automated-recognition-and-attendance-system-TASK-006 | Verification and Build | Release/Ops | AI | TASK-003,TASK-004,TASK-005 | done | 80 | Docker image successfully built and container recreated | CLI build output | `docker compose build` success | none | UAT verify on live system | Recreated container |

## Risks / Blockers / Assumptions / Decisions

| ID | Type | Description | Owner | Status |
|---|---|---|---|---|
| R-001 | Risk | CCTV local python environment script error (ImportError) | Developer | open |
| D-001 | Decision | Implemented filtering logic client-side on Vue via computed property instead of adding a new REST endpoint | AI | closed |

## Verification

| Command / Check | Result | Evidence / Notes |
|---|---|---|
| `docker compose build frontend backend` | pass | Vue code compiled successfully into production distribution (39s compilation time) |
| Container recreate | pass | Containers recreated and running healthy |

## Final Handoff Link

- Change record: `docs/changes/2026-07-17-unique-checkin-display.md`
