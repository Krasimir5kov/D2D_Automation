# Reference material — not part of the running framework

Everything under this folder is reference/documentation material for a human or an AI
assistant working on this project. Nothing here is imported by test/page-object code — the
actual framework lives in `../src/`, `../tests/`, `../playwright.config.ts`, etc. This folder
exists purely so that reference material doesn't clutter the framework root, per the user's
2026-09-18 request.

See `D2D_Automation/CLAUDE.md`'s "⚠️ Reference sources" section for the full mandatory
check-order (which source wins when two disagree) — this file is just a map of what lives
where.

## `docs/` — living project documentation
- `D2D_Playwright_Attributes_Reference.md` — the consolidated, git-verified id/attribute
  catalog. Re-read fresh before any locator/attribute suggestion.
- `decisions.md` — architecture decisions log (ADR-001+, "in force").
- `best-practices.md` — assertion/locator/test-structure conventions + roadmap.
- `project-map.mmd` — Mermaid diagram of the framework's structure.
- `jira-exports/` — static Jira ticket exports (POSS-3424 through POSS-3429 `.doc` files, plus
  a full Jira HTML export) kept for offline reference; not auto-synced with live Jira.

## `fe-source/testIds/` — local mirror of the FE repo's stable-id constants
A point-in-time **copy** of
`D2D Repo\microfrontend-door2door-main\src\frontend\shared\testIds\*.ids.ts` — the frontend
team's own centralized stable-id constants (the POSS-3397→3422 ticket series' output). This
exists because the live sibling `D2D Repo` checkout is not guaranteed to be present on every
machine this project runs on (e.g. it may not exist on a laptop that only has `D2D_Automation`
checked out), and it isn't guaranteed to stay in place long-term either. See
`fe-source/testIds/README.md` for the capture date and refresh instructions — **prefer the
live sibling repo when it's available, since this mirror can go stale; fall back to this copy
when it isn't.**

## `dom/<page>/` — live DOM captures the user has pasted
Real DOM the user captured from the running app (currently `dom/konfiguration/`, 5 files,
captured 2026-09-18). This wins over both `docs/` and `fe-source/` on any conflict — it's what
the app actually renders. Kept on disk rather than discarded after one read, so a future
session doesn't have to ask the user to re-paste something already captured.
