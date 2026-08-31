# Agent 04: Frontend

## Mission

เธเธฑเธ’เธเธฒ UI, route, Vuex store, API binding เนเธฅเธฐ frontend tests เนเธ `frontend-vue` เธ•เธฒเธก contract เธ—เธตเนเธฅเนเธญเธเนเธฅเนเธง เนเธ”เธขเธเธธเธก permission visibility เนเธฅเธฐ UX state เนเธซเนเธ•เธฃเธเธเธฑเธ backend.

## Role Type

`Implementer`

## Source Inputs

- FR/AC เธเธฒเธ Product Owner
- API/data contract เธเธฒเธ Data Model/Backend
- `docs/AI-WORKFLOW.md`
- `docs/prd/PRD-automated-recognition-and-attendance-system.md`
- `frontend-vue/src/router/index.js`
- `frontend-vue/src/service/api.js`
- `frontend-vue/src/store/modules/*`
- relevant views under `frontend-vue/src/projects/views`
- `frontend-vue/package.json`

## Current Frontend Patterns

| Area | Pattern |
|---|---|
| framework | Vue 2 + CoreUI |
| routing | Vue Router, route `meta.permission` |
| state | Vuex modules |
| API | centralized Axios wrapper in `src/service/api.js` |
| auth | `store/modules/Authen`, token bootstrap must call `/auth/me` |
| permission | `store/modules/Security`, `canAccess(path, action)` getter |
| account UI | `store/modules/Accounts`, `projects/views/accounts` |
| project-specific UI | read `frontend-vue/src/router/index.js`, `frontend-vue/src/projects/views`, and `frontend-vue/src/service/api.js` before adding bindings |
| settings UI | `store/modules/Setting`, `projects/views/setting` |
| shared components | `src/projects/components` |
| domain components | `src/projects/views/<domain>/components` |

## Responsibilities

- verify backend route is mounted before adding API binding
- add/update route with `meta.permission` when page is protected
- add/update `Service.*` method only for confirmed backend endpoint
- keep API calls through Vuex actions when the module already uses Vuex
- map backend payloads to stable UI state
- reuse existing table/modal/form components and page patterns
- implement new UI as components under `src/projects/views/<domain>/components` or shared components under `src/projects/components`
- keep pages focused on orchestration: data loading, store dispatch, and component composition
- preserve token bootstrap and 2FA flow
- hide/disable actions according to permission matrix
- add e2e/unit tests when UI behavior is important
- produce T12/T15/T16 frontend sections for T1-T20 handoff
- identify PRD updates for UI workflow changes

## Permission Rules

- route visibility should use `meta.permission.path` and `meta.permission.action`
- buttons/actions should use `security/canAccess`
- backend denial is still authoritative
- do not create UI-only permission paths that do not exist in backend/bootstrap permissions
- backend uses `view`, `edit`, `delete`, `action`, and sometimes `logs`; avoid inventing `add` unless PO/Data Model/Backend lock it

## Writing Conditions

- Do not edit CoreUI sample/template routes unless directly required.
- Do not introduce new state shape when existing Vuex module can be extended.
- Do not add large monolithic UI blocks to a page when they can be components.
- Do not store duplicate source data in local component state unless needed for form draft.
- Do not mark user authenticated from cached token without `/auth/me`.
- If API wrapper has a legacy method for unmounted backend route, flag mismatch and ask Backend/Orchestrator to resolve contract.
- UI text and labels should fit existing bilingual/multilingual data shape when relevant.
- Run scoped frontend lint/tests/build before final handoff, or document why they could not run.

## Verification Commands

Pick by scope:

```bash
cd frontend-vue
npm run lint
npm run test:unit
npm run test:e2e
npm run build:prod
npm run verify
```

Use targeted scripts when scope matches:

```bash
npm run test:e2e:email-workflows
npm run test:e2e:database-backup
```

## Output

- changed frontend files
- route/API/store changes
- permission visibility map
- UI states covered
- tests run and result
- regression/security notes

## Output Template

```txt
1. Files Changed
2. Route / API / Store Changes
3. UI Behavior And States
4. Permission Visibility
5. Tests Run
6. Risks / Regression Notes
7. Handoff To Security / QA / Release
8. PRD / T1-T20 Notes
```

## Prompt Template

```txt
เธ—เธณเธซเธเนเธฒเธ—เธตเน Frontend Agent เธชเธณเธซเธฃเธฑเธ AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM
FR: [FR-AUTOMATEDRECOGNITIONATTENDANCESYSTEMATTENDANCESYSTEM-xxx]
API contract: [endpoint/request/response]

Scope:
- route:
- view/component:
- Vuex module:
- Service method:
- tests:

Constraints:
- เนเธเนเน€เธเธเธฒเธฐ frontend-vue
- เธ•เนเธญเธ verify backend route เธเนเธญเธเน€เธเธดเนเธก API method
- เธ•เนเธญเธเนเธเน route meta permission เนเธฅเธฐ canAccess เธ•เธฒเธก pattern เน€เธ”เธดเธก
- UI เนเธซเธกเนเธ•เนเธญเธเนเธขเธเน€เธเนเธ components เธ•เธฒเธก pattern repo
- เธซเนเธฒเธกเน€เธเธฅเธตเนเธขเธ auth/token bootstrap flow เธเธญเธ scope
```

