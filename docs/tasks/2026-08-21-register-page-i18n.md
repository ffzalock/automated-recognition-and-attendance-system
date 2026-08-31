# Tasklist: Register Page i18n & Dropdown Localization Fix

| Field | Value |
|---|---|
| Date | 2026-08-21 |
| Project | AUTOMATED RECOGNITION ATTENDANCE SYSTEM ATTENDANCE SYSTEM |
| Module / Feature | Register Page Enrollment i18n & Dropdown UI Localization |
| Requirement | Separate Thai and English text in School and Program dropdown UI, while preserving original full string format when saving to MongoDB |
| Active Change Record | `docs/changes/2026-08-21-register-page-i18n.md` |
| Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed delivery progress |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Page view | `frontend-vue/src/projects/views/accounts/Register.vue` | Replaced static Thai title, subtitles, and CCTV button link with `$t('registerPage...')` |
| Form component | `frontend-vue/src/components/Attendance/FaceEnrollForm.vue` | Refactored `MFU_SCHOOLS` data model into distinct `th`, `en`, and `raw` properties. Select options UI display `school.th` in TH mode and `school.en` in EN mode without parenthesized strings. `registerFace()` payload uses `raw` to save original composite format in MongoDB. Bound form labels, placeholders, instructions, angle cards, buttons, preview texts, and messages to `$t('registerPage...')` |
| Thai Translations | `frontend-vue/src/store/lang/th.js` | Added `registerPage` object |
| English Translations | `frontend-vue/src/store/lang/en.js` | Added `registerPage` object |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| REG-I18N-001 | Source discovery | Orchestrator | AI | none | done | 100 | Identified static Thai strings and parenthesized dropdown strings in `Register.vue` and `FaceEnrollForm.vue` | `Register.vue`, `FaceEnrollForm.vue` | n/a | none | complete | Source map |
| REG-I18N-002 | Update Register.vue | Frontend | AI | REG-I18N-001 | done | 100 | Bound template text to `$t('registerPage...')` | `Register.vue` | Template updated | none | complete | Component edit |
| REG-I18N-003 | Update FaceEnrollForm.vue dropdowns & MongoDB payload | Frontend | AI | REG-I18N-001 | done | 100 | Separated `MFU_SCHOOLS` into distinct `th`, `en`, and `raw` entries. Bound select options to dynamic locale UI and preserved raw string for MongoDB | `FaceEnrollForm.vue` | Component updated | none | complete | Component edit |
| REG-I18N-004 | Update lang dictionaries | Frontend | AI | REG-I18N-002,REG-I18N-003 | done | 100 | Added `registerPage` dictionaries in `th.js` and `en.js` | `th.js`, `en.js` | Lang files updated | none | complete | Translation keys |
| REG-I18N-005 | Documentation | Orchestrator | AI | REG-I18N-004 | done | 100 | Created tasklist & change record | `docs/changes/2026-08-21-register-page-i18n.md` | Docs created | none | complete | Docs set |

## Final Handoff Link

- Change record: `docs/changes/2026-08-21-register-page-i18n.md`
