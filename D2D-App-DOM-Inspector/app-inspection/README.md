# D2D App DOM Inspector

Playwright + TypeScript inspection tool for the D2D internal application.
Captures screenshots, DOM, accessibility snapshots, locators, test assertions, and Mermaid flow diagrams for every page.

---

## Quick start

```bash
cd app-inspection
npm install
npm run install:browsers

# Copy env file and set your BASE_URL
copy .env.example .env

# Log in and save the session
npm run login

# Run full inspection (all 6 pages + exploration)
npm run inspect

# Guided interactive mode
npm run inspect:guided

# Inspect the current browser state (re-use open session)
npm run inspect:state
```

---

## Prerequisites

- Node.js 18+
- Playwright browsers: `npm run install:browsers`
- Auth session: `npm run login` → saves `auth/storageState.json`

---

## Commands

| Command | Description |
|---------|-------------|
| `npm run login` | Manual login — opens browser, waits for Enter, saves session |
| `npm run inspect` | Full automated inspection of all 6 pages |
| `npm run inspect:guided` | Interactive terminal loop — inspect specific targets |
| `npm run inspect:state` | Capture current DOM/screenshot without full run |
| `npm run install:browsers` | Install Chromium browser for Playwright |

---

## Playwright MCP setup

Register the Playwright MCP server for Claude Code browser control:

```bash
claude mcp add playwright npx @playwright/mcp@latest
```

After registration, Claude Code can use the MCP server to interact with the browser directly during inspection sessions.

---

## Guided mode usage

```bash
npm run inspect:guided
```

Then type a target at the `>` prompt:

```
> objekte                        # full page inspection
> objekte alle filter            # open and inspect Alle Filter modal
> objekte side panel             # click first item and inspect side panel
> objekte filters                # discover and inspect all filters
> objekte dom                    # capture DOM + screenshot only
> objekte explore                # full mouse exploration
> objekte locators               # generate Playwright locators
> objekte assertions             # generate test assertions
> baulose                        # full inspection of Baulose
> pages                          # list all configured pages
> menu                           # show help
> exit                           # close browser and quit
```

---

## Pages inspected

| Page ID | Name | Side Panel | Alle Filter | Create Modal |
|---------|------|-----------|-------------|--------------|
| `baulose` | Baulose | ✅ | — | — |
| `objekte` | Objekte | ✅ | ✅ | — |
| `sales-action` | Sales Action | ✅ | ✅ | — |
| `benutzerverwaltung` | Benutzerverwaltung | — | — | ✅ |
| `importe` | Importe | — | — | — |
| `konfiguration` | Konfiguration | — | — | — |

---

## Output files

```
output/
  pages/                         # per-page Markdown reports
    baulose.md
    objekte.md
    ...
  screenshots/                   # full-page and element screenshots
  dom/                           # cleaned HTML DOM captures
  accessibility/                 # aria snapshots (.txt)
  explorations/                  # per-element click discoveries
    {pageId}/{index}-{element}/
      before.png
      after.png
      dom-after.html
      a11y-after.txt
      discovery.json
    exploration-map.json
  flows/
    application-flow.mmd         # Mermaid flowchart TD
    page-component-flow.mmd      # Mermaid flowchart LR with subgraphs
  data/
    application-map.json
    component-inventory.json
    filter-inventory.json
    modal-inventory.json
    side-panel-inventory.json
    button-inventory.json
    locator-inventory.json
    navigation-paths.json
    exploration-index.json
    inspection-run.json
  reports/
    full-inspection-report.md
  test-suggestions/
    suggested-playwright-tests.md
```

---

## Agent architecture

Each inspection pipeline step is handled by a dedicated TypeScript agent module in `scripts/agents/`:

| Agent | File | Responsibility |
|-------|------|----------------|
| Safety Click | `safetyClickAgent.ts` | Classifies elements — blocks DESTRUCTIVE/RISKY |
| Navigation | `navigationAgent.ts` | 3-strategy page navigation (URL, hash, UI click) |
| Page DOM | `pageDomAgent.ts` | Screenshot, DOM, a11y snapshot, element collection |
| Filter Inspection | `filterInspectionAgent.ts` | Discover filters, open dropdowns, capture options |
| Modal Inspection | `modalInspectionAgent.ts` | Open modals, inspect content, close via X / Escape |
| Side Panel Inspection | `sidePanelInspectionAgent.ts` | Click list items, capture panel DOM |
| Locator | `locatorAgent.ts` | Generate Playwright locators by priority |
| Assertion | `assertionAgent.ts` | Generate test assertions for pages and components |
| Flow Diagram | `flowDiagramAgent.ts` | Generate Mermaid flowcharts |
| Reporter | `reporterAgent.ts` | Write per-page .md and full report |
| Orchestrator | `orchestratorAgent.ts` | Coordinates all agents in order per page |

The orchestrator runs this pipeline per page:
1. **Navigation Agent** — navigate to page URL
2. **Page DOM Agent** — screenshot, DOM, a11y, elements
3. **Filter Inspection Agent** — discover and inspect filters
4. **Modal Inspection Agent** — open and inspect modals
5. **Side Panel Inspection Agent** — click items, inspect panels
6. **Locator Agent** — generate locators from discovered elements
7. **Assertion Agent** — generate test assertions
8. **Reporter Agent** — write partial output immediately

---

## Claude Code subagents

Subagent definitions are in `.claude/agents/`:

- `app-inspection-orchestrator.md` — master coordinator
- `safety-click-agent.md` — element safety classifier
- `navigation-agent.md` — page navigation strategies
- `page-dom-agent.md` — DOM and screenshot capture
- `filter-inspection-agent.md` — filter discovery
- `modal-inspection-agent.md` — modal inspection and close
- `side-panel-inspection-agent.md` — side panel inspection
- `locator-agent.md` — Playwright locator generation
- `assertion-agent.md` — test assertion generation
- `flow-diagram-agent.md` — Mermaid diagram generation
- `reporter-agent.md` — report writing

---

## Safety rules

The following actions are **NEVER performed** by any agent or script:

- ❌ Click **Delete**, **Löschen**, **Entfernen** (on data rows)
- ❌ Click **Save**, **Speichern**, **Submit**, **Bestätigen**
- ❌ Click **Import** (file import trigger)
- ❌ Click **Confirm**, **Send**, **Assign**, **Update** (on form submissions)
- ❌ Click **Filter anwenden** (applies filter changes)
- ❌ Submit any form

Safe actions:
- ✅ Navigate to pages
- ✅ Open modals for inspection (close with X)
- ✅ Click filter dropdowns to inspect options
- ✅ Click list items to open side panels (navigate away to close)
- ✅ Click tabs and navigation links
- ✅ Click **Alle Filter entfernen** (clears selection, safe)

---

## Configuration

Edit `app-inspection/.env`:

```env
BASE_URL=https://portal-int.open-frontends.a1.net/door2door#/objekte/neubau
STORAGE_STATE_PATH=auth/storageState.json
OUTPUT_DIR=output
HEADLESS=false
SLOW_MO=0
DEFAULT_TIMEOUT=30000
```
