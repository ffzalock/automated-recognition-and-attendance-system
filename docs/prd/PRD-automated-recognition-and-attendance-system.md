# PRD: AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM

## Document Control

| Field | Value |
|---|---|
| Product | AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM |
| Project code | automatedrecognitionandattendancesystem |
| Version | 0.2 |
| Status | Source-Aligned Baseline (Updated with Unique Check-in Feature) |
| Source checked date | 2026-07-17 |
| Related workflow | `docs/AI-WORKFLOW.md` |
| Related agents | `docs/agents/README.md` |
| Public domain | `automated-recognition-and-attendance-system.mfu.ac.th` |

## Source Truth

This PRD must stay aligned with current source. If source and PRD conflict, source wins until PRD is updated. Do not infer behavior from this document without checking the linked source files.

| Area | Source |
|---|---|
| Backend mounted routes | `backend-node/server/routes/app.routes.js` |
| Backend module routes | `backend-node/server/Project/*/*.routes.js` |
| Backend package scripts | `backend-node/package.json` |
| Frontend routes | `frontend-vue/src/router/index.js` |
| Frontend API wrapper | `frontend-vue/src/service/api.js` |
| Frontend stores | `frontend-vue/src/store/modules/*` |
| Frontend package scripts | `frontend-vue/package.json` |
| Environment notes | `ENVIRONMENTS.md`, `DEPLOY-UBUNTU.md` |

## Product Overview

AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM is a student attendance tracking and facial recognition management application integrated with IAM, providing registry workflows, an account directory, CCTV camera synchronization, security permissions, settings, and deployment through Docker.

Detected package names at generation time:

| Runtime | Package |
|---|---|
| Backend | `automatedrecognitionandattendancesystem-api` |
| Frontend | `automatedrecognitionandattendancesystem-frontend` |

## Mounted Backend Route Evidence

The following lines were read from `backend-node/server/routes/app.routes.js` at generation time. Re-read the file before changing behavior.

- 11: app.use(path + '/automatedrecognitionandattendancesystem', automatedrecognitionandattendancesystemRoutes);
- 12: app.use(path + '/setting', settingsRoutes);
- 13: app.use(path + '/security', securityRoutes);
- 14: app.use(path + '/cctv', cctvRoutes);
- 15: app.use(path + '/attendance', attendanceRoutes);
- 16: app.use(path, accountRoutes);

## Backend Source Areas

| Module | Source Location |
|---|---|
| `accounts` | `backend-node/server/Project/accounts` |
| `address` | `backend-node/server/Project/address` |
| `attendance` | `backend-node/server/Project/attendance` |
| `automatedrecognitionandattendancesystem` | `backend-node/server/Project/automatedrecognitionandattendancesystem` |
| `category` | `backend-node/server/Project/category` |
| `cctv` | `backend-node/server/Project/cctv` |
| `security` | `backend-node/server/Project/security` |
| `settings` | `backend-node/server/Project/settings` |

## Frontend Source Areas

| accounts | `frontend-vue/src/projects/views/accounts` |
| automatedrecognitionandattendancesystem | `frontend-vue/src/projects/views/automatedrecognitionandattendancesystem` |
| ocr | `frontend-vue/src/projects/views/ocr` |
| operations | `frontend-vue/src/projects/views/operations` |
| security | `frontend-vue/src/projects/views/security` |
| setting | `frontend-vue/src/projects/views/setting` |

## Functional Baseline

### FR-AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM-001 Authentication And Session

Authentication, token bootstrap, 2FA, and session behavior must be verified from account/auth routes, Authen store, login views, and live or mocked E2E tests before modification.

The 2FA verification code UI must allow users to paste a full OTP value or an email text snippet containing the OTP. The frontend may normalize the pasted text into the six-character code, but the verification endpoint and backend validation remain unchanged.

Frontend session bootstrap must skip silent `/auth/me` when no local token and no IAM session hint exist. When a local token or IAM session hint exists, restore must use silent auth so cross-application navigation can reuse IAM session state without creating avoidable unauthenticated 401 requests.

### FR-AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM-002 Account Directory And Lifecycle

Account directory, invite/update/status/lifecycle behavior must use the project IAM scope rules and must not mutate shared IAM account state without an explicit source-backed decision.

### FR-AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM-003 Project Business Workflows

Project-specific workflows must be defined from mounted backend routes, frontend routes, service modules, and current permission paths. Add new paths to environment/bootstrap permission configuration before exposing UI actions. Key workflows include:
- The web-based Check-In process (`CheckIn.vue`) which integrates with the attendance API via majority voting on frontend face detections, mirroring the AI engine's behavior.
- Unique Today's Check-In Display: An additional display list on both `CheckIn.vue` and `CctvViewer.vue` that filters real-time attendance logs to show only unique check-ins for the current day, color-coded in green (`text-success`).

### FR-AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM-004 Security And Permission Management

Protected routes require authentication plus permission checks. UI visibility must use the Security store/canAccess pattern and backend denial remains authoritative.

Frontend permission bootstrap must reuse an in-flight `fetchMyPermissions` request for concurrent callers so route guards wait for the same permission matrix instead of issuing duplicate requests or evaluating access before permissions finish loading.

### FR-AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM-005 Settings And Operations

Settings, runtime access, database backup, email notification, workflow, audit, and deployment behavior must be verified from current settings routes/views and deployment files before release.

## Non-Functional Requirements

| Area | Requirement |
|---|---|
| Source discipline | read source before planning or coding; record evidence in T1-T20 docs |
| Security | protect API and UI by IAM/session/permission checks |
| Maintainability | follow current repo style before adding abstractions |
| Frontend structure | new sizeable UI must be component-based |
| Compatibility | preserve existing API/response shape unless FR explicitly changes it |
| Testing | run scoped tests/E2E/smoke before claiming completion |
| Documentation | update PRD and T1-T20 handoff when behavior, API, UI, permission, data, env, or release contract changes |

## PRD Update Rules

Update this PRD when any change affects:

- requirement or acceptance criteria
- API endpoint, request, response, or error behavior
- frontend route, page behavior, component workflow, or navigation
- schema, migration, seed, index, rollback, or data ownership
- permission path/action/data scope
- environment, deploy, rollback, smoke, or monitoring behavior
- test or release expectation
