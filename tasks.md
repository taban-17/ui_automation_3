# Router UI Automation Platform — Task Tracker

> Keep this file at the repo root as `TASKS.md`. Check off items as they land; do not delete completed items — they form the audit trail for the project.

---

## Legend

- `[ ]` — not started
- `[~]` — in progress
- `[x]` — done
- `[!]` — blocked / needs decision
- `[-]` — dropped / deferred

---

## Phase 0 — Project Setup

- [x] `npm init`
- [x] Install backend deps (`express`, `cors`, `zod`)
- [x] Install dev deps (`typescript`, `tsx`, `nodemon`, `@types/*`)
- [-] `ts-node` — dropped, incompatible with TypeScript 7; replaced by `tsx`
- [x] Create `tsconfig.json` with `strict: true`, `rootDir: src`, `outDir: dist`
- [x] Add `dev`, `build`, `start` scripts to `package.json`
- [x] Establish folder layout (`src/server`, `src/shared`, `src/config`, `data/`)

---

## Phase 1 — Backend Foundation

### 1.1 Types & Schema

- [x] `src/shared/types/router-state.ts` — `RouterState` interface
- [x] `src/shared/types/router-state.ts` — `DeepPartial<T>` helper
- [x] `src/shared/types/router-state.ts` — `RouterStatePatch = DeepPartial<RouterState>`
- [x] `src/config/router-schema.ts` — full Zod schema
- [x] `src/config/router-schema.ts` — patch Zod schema (`z.deepPartial(routerStateSchema)`)
- [x] `src/config/router-schema.ts` — `RouterStatePatchInput` inferred type

### 1.2 State Manager

- [x] `src/server/services/state-manager.ts` — `loadState`
- [x] `src/server/services/state-manager.ts` — `saveState` (validated)
- [x] `src/server/services/state-manager.ts` — `updateState` (queued)
- [x] `src/server/services/state-manager.ts` — `listRouters`
- [x] `src/server/services/state-manager.ts` — `deepMerge` (no implicit `any`)
- [x] Per-router serialized write queue (`enqueue`)
- [x] Append change record to `data/.history/<router>.jsonl` inside `updateState`
- [x] `resetState(routerId)` — restore from `data/.initial/<router>.json`
- [x] `ensureDirs()` — create `.initial/` and `.history/` at boot

### 1.3 Persistence Data

- [x] `data/router-a.json`
- [x] `data/router-b.json`
- [x] `data/router-c.json`
- [x] `data/router-d.json`
- [x] `data/.initial/*.json` — frozen snapshots for reset
- [x] `data/.history/` directory created at boot
- [x] `src/server/seed.ts` — idempotent seed script (`npm run seed`)

### 1.4 Routes

- [x] `GET /api/routers`
- [x] `GET /api/routers/:id`
- [x] `GET /api/routers/:id/state`
- [x] `PATCH /api/routers/:id/state`
- [x] `POST /api/routers/:id/reset`
- [x] `GET /api/routers/:id/history`

### 1.5 Middleware

- [x] `errorHandler` — Zod → 400 with `err.issues`
- [x] `errorHandler` — `ENOENT` → 404
- [x] `errorHandler` — fallback → 500

### 1.6 Verification

- [x] Smoke test: `GET /api/routers` returns 4 ids
- [x] Smoke test: `PATCH` changes `wireless.ssid` and persists
- [x] Smoke test: `POST .../reset` restores initial value
- [x] Smoke test: `GET .../history` returns ordered change log
- [x] Smoke test: concurrent `PATCH` calls serialize cleanly (no lost writes)

**Phase 1 deliverable:** ✅ complete (8/8 smoke tests passing)

---

## Phase 2 — Router Interfaces

### Shared Prerequisites

- [ ] Choose frontend toolchain (Vite + React vs. Next.js)
- [ ] Add `frontend/` workspace (or `src/interfaces/` served by Express as static)
- [ ] `src/shared/api/client.ts` — typed fetch wrapper for `/api/routers/*`
- [ ] Dev proxy from frontend to `:4000`

### 2.1 Router A — Conventional Admin

- [ ] Route mount point chosen (e.g. `/router-a`)
- [ ] Layout: sidebar + separate pages
- [ ] Page: Wireless Settings → Basic Configuration (`SSID` → `wireless.ssid`)
- [ ] Page: Wireless Settings → Security (`Pre-Shared Key` → `wireless.password`)
- [ ] Page: LAN → IP Address (`LAN IP Address` → `lan.ipAddress`)
- [ ] `Save` button → `PATCH` → success toast
- [ ] Manual round-trip: change SSID → refresh → value persists

### 2.2 Router B — Consumer-Friendly

- [ ] Route mount point (`/router-b`)
- [ ] Layout: card dashboard, simplified labels
- [ ] Card: Main Network (`Wi-Fi Name` → `wireless.ssid`)
- [ ] Card: Guest Wi-Fi (`guestNetwork.enabled`)
- [ ] `Apply changes` button → `PATCH`

### 2.3 Router C — Technical / Enterprise

- [ ] Route mount point (`/router-c`)
- [ ] Layout: tabs + dense forms
- [ ] Tab: WLAN Configuration → SSID Profile (`WLAN SSID`)
- [ ] Tab: Interface → Management Address (`lan.ipAddress`)
- [ ] `Apply` button → `PATCH`

### 2.4 Router D — Wizard

- [ ] Route mount point (`/router-d`)
- [ ] Multi-step wizard: Network Identification → Security → Confirm
- [ ] Terminology: `Network Identifier`, `Network Access Key`, `Local Gateway`
- [ ] Final `Submit configuration` → `PATCH`

### 2.5 Cross-Cutting

- [ ] Confirm one router's `PATCH` never mutates another's file
- [ ] Confirm all four read identical canonical state after changes

**Phase 2 deliverable:** Four independently accessible, stateful interfaces.

---

## Phase 3 — Workflow Diversity

- [ ] Divergent save behaviors (`Apply` vs. auto-save vs. `Save and Restart`)
- [ ] Inline validation with error text on invalid SSID length
- [ ] Modal confirmation on destructive changes
- [ ] Simulated apply delay (300–800 ms) for realism
- [ ] Per-band wireless controls (2.4 GHz / 5 GHz radios)
- [ ] `rebootRequired` flag set by LAN changes → UI banner
- [ ] Reboot-required → confirm → clear flag

---

## Phase 4 — Automation Testing

### 4.1 Harness

- [x] Install Playwright (`@playwright/test`)
- [x] Install Chromium browser (`npx playwright install chromium`)
- [x] `playwright.config.ts` — base URL `:4000`, `webServer` auto-start
- [x] `tests/helpers/router-api.ts` — typed `resetRouter` / `getState` / `patchState`
- [x] Remove boilerplate `tests/example.spec.ts`

### 4.2 API-level scenarios (state layer)

- [x] T001 — Change my Wi-Fi name (API-level, 4/4 routers)
- [x] T002 — Change my wireless password (API-level, 4/4 routers)
- [x] T003 — Turn off Wi-Fi (API-level, 4/4 routers)
- [x] T004 — Hide my network name (API-level)
- [x] T005 — Enable guest Wi-Fi (API-level)
- [x] T006 — Change my router IP (API-level, 4/4 routers)
- [x] T007 — Enable DHCP (API-level)
- [x] T008 — Change the Wi-Fi channel (API-level)

### 4.3 UI-level scenarios (browser automation)

- [ ] Scenario runner: reset → drive UI → read `/state` → diff expected
- [ ] T001 — Change my Wi-Fi name (UI, all 4 routers)
- [ ] T002 — Change my wireless password (UI, all 4 routers)
- [ ] T003 — Turn off Wi-Fi (UI, all 4 routers)
- [ ] T004 — Hide my network name (UI, all 4 routers)
- [ ] T005 — Enable guest Wi-Fi (UI, all 4 routers)
- [ ] T006 — Change my router IP (UI, all 4 routers)
- [ ] T007 — Enable DHCP (UI, all 4 routers)
- [ ] T008 — Change the Wi-Fi channel (UI, all 4 routers)

### 4.4 Diagnostics

- [ ] Failure logging distinguishes: wrong field vs. wrong value vs. unsaved vs. wrong navigation
- [ ] Navigation-step counter per scenario
- [ ] Execution-time capture per scenario

**Phase 4 deliverable:** Repeatable automated testing environment (API + UI).

---

## Phase 5 — Evaluation

- [ ] Script: run all 8 scenarios × 4 routers, collect metrics
- [ ] Metrics: completion rate, config accuracy, navigation steps, execution time
- [ ] Terminology-generalization report
- [ ] Workflow-generalization report
- [ ] Failure taxonomy write-up
- [ ] Publish benchmark dataset (JSON scenarios + expected outputs)

---

## Open Decisions

| # | Question | Status |
|---|---|---|
| 1 | Frontend | Single Vite + React + Tailwind app, `react-router-dom` — resolved |
| 2 | History format | JSONL append — resolved |
| 3 | Reset source | `data/.initial/` snapshot — resolved |
| 4 | Auth | None for now — resolved |
| 5 | Unknown keys on `PATCH` | Ignored — resolved |

---

## Blockers

- *None*

---

## Session Log

| Date | Entry |
|---|---|
| — | Phase 0 + Phase 1 core complete. `deepMerge`, `String(req.params.id)`, Zod `err.issues` all resolved. |
| 2026-10-29 | Phase 1 complete — reset, history, ensureDirs wired; 8/8 smoke tests pass. Tooling switched to `tsx`. |
| 2026-10-29 | Playwright installed. API-level T001 / T003 / T006 × 4 routers green (12/12). |
| 2026-10-29 | API matrix 36/36 green. Nested-patch bug caught and fixed via `z.deepPartial`. |
| 2026-10-29 | Fixed playwright/tests/helpers/router-api.ts by line change `import { RouterState } from "../../../router_ui_server/src/shared/types/router-state";`. |