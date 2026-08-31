# T1-T20 Change Document: Sidebar Navigation Menu Translation Fix

## T1 Change Title

| Field | Value |
|---|---|
| Change ID | CHG-NAV-I18N |
| Module | frontend-vue / containers |
| Date | 2026-08-21 |
| Owner / Agent | Frontend / Orchestrator |
| Status | Done |
| Active Tasklist | `docs/tasks/2026-08-21-nav-translation-fix.md` |

## T2 Requirement

- User report: "ผมกด เปลี่ยนภาษาแล้วแต่ แถบข้างล่าง มันยังเป็นไทย" ("I changed the language but the bottom sidebar menu items are still in Thai").
- Cause: Menu items for Check-In (`เช็คอิน`), Register (`ลงทะเบียน`), and CCTV (`CCTV`) were hardcoded as Thai string literals in `_nav.js` instead of using `$t()` translation functions.
- Goal: Make all sidebar navigation items dynamic and properly reactive to language toggles (Thai/English).

## T3 Source Evidence

| Area | Source path / route / command | What was verified |
|---|---|---|
| Navigation Builder | `frontend-vue/src/containers/_nav.js` | Found hardcoded `'เช็คอิน'` and `'ลงทะเบียน'` strings |
| Language File (TH) | `frontend-vue/src/store/lang/th.js` | Checked and added `nav.checkIn`, `nav.register`, `nav.cctv` |
| Language File (EN) | `frontend-vue/src/store/lang/en.js` | Checked and added `nav.checkIn`, `nav.register`, `nav.cctv` |
| Sidebar Component | `frontend-vue/src/containers/TheSidebar.vue` | Verified reactive re-rendering on `$i18n.locale` change |

## T4 Current Behavior

- Previous behavior: Sidebar menu items under Account Directory showed static Thai text ("เช็คอิน", "ลงทะเบียน") even when English language was selected.
- New behavior: Sidebar menu items dynamically render "Check-In", "Register", "CCTV" when English is selected, and "เช็คอิน", "ลงทะเบียน", "CCTV" when Thai is selected.

## T6 Scope

In scope:
- Refactor `frontend-vue/src/containers/_nav.js` to use `t('nav.checkIn')`, `t('nav.register')`, and `t('nav.cctv')`.
- Add `checkIn`, `register`, `cctv` keys under `nav` object in `th.js` and `en.js`.

Out of scope:
- Modifying backend endpoints or route paths.

## T15 Implementation Summary

| File | Change |
|---|---|
| `frontend-vue/src/containers/_nav.js` | Replaced hardcoded Thai strings with `t('nav.checkIn')`, `t('nav.register')`, `t('nav.cctv')` calls. |
| `frontend-vue/src/store/lang/th.js` | Added `checkIn: "เช็คอิน"`, `register: "ลงทะเบียน"`, `cctv: "CCTV"` to `nav` translations. |
| `frontend-vue/src/store/lang/en.js` | Added `checkIn: "Check-In"`, `register: "Register"`, `cctv: "CCTV"` to `nav` translations. |

## T20 Final Handoff

```txt
Feature: Sidebar Navigation Menu Translation Fix
Status: Done
Active tasklist: docs/tasks/2026-08-21-nav-translation-fix.md
Changed files: _nav.js, th.js, en.js
Impact: Sidebar menu items now respond dynamically when switching between Thai and English.
```
