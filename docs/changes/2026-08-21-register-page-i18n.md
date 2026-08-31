# T1-T20 Change Document: Register Page i18n & UI Dropdown Localization

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | CHG-REGISTER-I18N |
| Module | frontend-vue / accounts / register |
| Date | 2026-08-21 |
| Owner / Agent | Frontend / Orchestrator |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-21-register-page-i18n.md` |

## T2 Requirement

- User report: "อันนี้แก้แค่หน้าเว็บนะ ตอนเก็บข้อมูลใน mongoก็เอาแบบเดิมนั่นและ แก้แค่หน้าเว็บเฉยๆ" ("Fix only the frontend web page display. When saving data in MongoDB, keep it in the exact original format as before. Fix only the web frontend display.")
- Location: `/accounts/directory/register` (`Register.vue` and `FaceEnrollForm.vue`).
- Goal:
  1. Frontend Web UI: Display clean single-language strings in dropdown options (pure Thai in TH mode, pure English in EN mode).
  2. Database (MongoDB): Save the original composite raw string format (e.g. `สำนักวิชาเทคโนโลยีสารสนเทศ (School of Information Technology)`) when registering student face data.

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Page view | `frontend-vue/src/projects/views/accounts/Register.vue` | Refactored page headers and card titles to `$t('registerPage...')` |
| Component | `frontend-vue/src/components/Attendance/FaceEnrollForm.vue` | Configured `MFU_SCHOOLS` entries with `id`, `th`, `en`, and `raw`. UI renders `school.th` / `school.en` dynamically, while form submit sends `school.raw` / `program.raw` to backend API / MongoDB. |
| Thai Translation | `frontend-vue/src/store/lang/th.js` | Added `th.registerPage` |
| English Translation | `frontend-vue/src/store/lang/en.js` | Added `en.registerPage` |

## T15 Implementation Summary

| File | Change |
|---|---|
| `frontend-vue/src/components/Attendance/FaceEnrollForm.vue` | Added `raw` property storing exact original composite strings for all 15 MFU Schools & Programs. Template select options show `isEn ? school.en : school.th` on screen. `registerFace()` payload maps `selectedSchool` / `selectedProgram` IDs to `schoolObj.raw` / `programObj.raw` before posting payload, preserving backward compatibility and MongoDB data integrity. |
| `frontend-vue/src/projects/views/accounts/Register.vue` | Replaced static Thai headers with `$t('registerPage...')`. |
| `frontend-vue/src/store/lang/th.js` | Added `th.registerPage` dictionary for Thai. |
| `frontend-vue/src/store/lang/en.js` | Added `en.registerPage` dictionary for English. |

## T20 Final Handoff

```txt
Feature: Register Page i18n & UI Dropdown Localization Fix
Status: Done
Active tasklist: docs/tasks/2026-08-21-register-page-i18n.md
Changed files: Register.vue, FaceEnrollForm.vue, th.js, en.js
Impact: The web UI displays clean localized text (TH or EN mode), while the MongoDB database continues to receive the exact original composite raw string format upon form submission.
```
