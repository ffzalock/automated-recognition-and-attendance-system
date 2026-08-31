# Tasklist: Sidebar Menu Translation Fix

| Field | Value |
|---|---|
| Date | 2026-08-21 |
| Project | AUTOMATED RECOGNITION ATTENDANCE SYSTEM ATTENDANCE SYSTEM |
| Module / Feature | Navigation Menu i18n |
| Requirement | Fix hardcoded Thai text in sidebar navigation menu items (เช็คอิน, ลงทะเบียน, CCTV) so they react to language switching |
| Active Change Record | `docs/changes/2026-08-21-nav-translation-fix.md` |
| Status | done |
| Overall Progress | 100% |
| Progress Type | Evidence-backed delivery progress |

## Source Evidence

| Area | Source | What was verified |
|---|---|---|
| Navigation Builder | `frontend-vue/src/containers/_nav.js` | Identified hardcoded string names for 'เช็คอิน', 'ลงทะเบียน', 'CCTV' |
| Thai Translation | `frontend-vue/src/store/lang/th.js` | Added `checkIn`, `register`, and `cctv` keys under `nav` |
| English Translation | `frontend-vue/src/store/lang/en.js` | Added `checkIn`, `register`, and `cctv` keys under `nav` |
| Sidebar Component | `frontend-vue/src/containers/TheSidebar.vue` | Verified reactive re-rendering on `$i18n.locale` change |

## Tasks

| Task ID | Task | Agent | Owner | Depends On | Status | Progress % | Progress Basis | Source Evidence | Tests Evidence | Blocker | Next Action | Output |
|---|---|---|---|---|---|---:|---|---|---|---|---|---|
| NAV-FIX-001 | Source discovery | Orchestrator | AI | none | done | 100 | Identified hardcoded strings in `_nav.js` | `_nav.js` | n/a | none | complete | Source map |
| NAV-FIX-002 | Update _nav.js | Frontend | AI | NAV-FIX-001 | done | 100 | Replaced string literals with `t('nav.checkIn')`, `t('nav.register')`, `t('nav.cctv')` | `_nav.js` | Code updated | none | complete | `_nav.js` edit |
| NAV-FIX-003 | Update lang files | Frontend | AI | NAV-FIX-002 | done | 100 | Added nav translation keys in `th.js` and `en.js` | `th.js`, `en.js` | Code updated | none | complete | Translation keys |
| NAV-FIX-004 | Documentation | Orchestrator | AI | NAV-FIX-003 | done | 100 | Created tasklist & change record | `docs/changes/2026-08-21-nav-translation-fix.md` | Docs created | none | complete | Docs set |

## Final Handoff Link

- Change record: `docs/changes/2026-08-21-nav-translation-fix.md`
