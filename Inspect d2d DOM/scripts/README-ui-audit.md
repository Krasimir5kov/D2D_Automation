# D2D INT UI Audit Utility

This utility audits rendered HTML DOM states for approved D2D INT routes using a visible Playwright Chromium browser and a dedicated local browser profile at `.audit-profile/`.

It is intentionally safe and local:

- It does not use Playwright MCP.
- It does not crawl.
- The default route audit never clicks application controls automatically.
- The dropdown-only audit clicks only safely detected visible filter dropdown triggers.
- The predefined-filter audit opens only explicitly configured filters from a local ignored config file.
- It never types into fields, selects options, submits forms, or modifies data.
- It navigates only to URLs listed in local ignored configuration files.
- It keeps raw DOM, screenshots, route URLs, and audit output local.

## Dependencies

If dependencies are missing in a fresh workspace, install them with:

```powershell
npm.cmd install playwright @axe-core/playwright
npm.cmd install --save-dev typescript tsx @types/node
```

Install the Chromium browser only if Playwright reports that it is missing:

```powershell
npx.cmd playwright install chromium
```

## Route Files

The real route list lives in:

```text
scripts/ui-audit.routes.local.json
```

This file contains internal URLs and must never be committed.

The Git-safe example file is:

```text
scripts/ui-audit.routes.example.json
```

The predefined-filter audit uses this local ignored file:

```text
scripts/ui-audit.predefined-filters.local.json
```

This file contains internal URLs plus explicit page/filter definitions and must never be committed.

## Run

From the project root:

```powershell
npm run ui:audit
```

The script opens the first configured route in a visible browser. Complete login manually, then return to the terminal and press Enter when the authenticated D2D application is visible.

Use this for the separate dropdown-only pass:

```powershell
npm run ui:audit:dropdowns
```

Use this for the controlled predefined-filter pass:

```powershell
npm run ui:audit:predefined-filters
```

## Automatic Route Sweep

After login, the utility navigates by URL only through each configured route. It waits for `domcontentloaded`, attempts `networkidle`, waits briefly for the SPA to settle, and captures the current rendered state.

For each route it writes:

```text
ui-audit/pages/<area>/<page>/<state>/raw-dom.html
ui-audit/pages/<area>/<page>/<state>/sanitized-dom.html
ui-audit/pages/<area>/<page>/<state>/interactive-elements.json
ui-audit/pages/<area>/<page>/<state>/accessibility-report.json
ui-audit/pages/<area>/<page>/<state>/IMPROVEMENTS.md
```

Screenshots are disabled by default in `scripts/ui-audit.ts` with `CAPTURE_SCREENSHOTS = false`.

## Manual Hidden-State Capture

Some dropdowns, modals, panels, expanded sections, or tabs only exist after you open them manually.

After the automatic sweep finishes, open the required hidden UI state in the browser yourself. Then run:

```text
capture-current <area> <page> <state>
```

Example:

```text
capture-current objects neubau-list all-filters-expanded
```

The utility captures only the current browser state. It does not click or change anything automatically.

## Dropdown-Only Audit

`npm run ui:audit:dropdowns` preserves the previous default audit output under `ui-audit/pages/`. It does not run the default-page capture flow and it does not overwrite existing route audit folders.

Each dropdown-only run creates a new timestamped folder:

```text
ui-audit/dropdown-audit-runs/<TIMESTAMP>/
```

For every route it revisits the configured URL, presses Escape to clear stale overlays, and inspects only individual filter dropdown triggers already visible on the normal route page. The full-filters overlay opener (`alle Filter` / `all filters`) is intentionally skipped. Native `select` elements are inspected without clicking or changing their value.

The dropdown-only audit never selects options, applies filters, submits forms, saves, deletes, imports, exports, or modifies data. Uncertain controls are skipped and documented in:

```text
ui-audit/dropdown-audit-runs/<TIMESTAMP>/SKIPPED-CONTROLS.md
```

Each route also gets detection diagnostics:

```text
ui-audit/dropdown-audit-runs/<TIMESTAMP>/pages/<area>/<page>/<state>/DROPDOWN-DETECTION-DIAGNOSTICS.md
```

The diagnostics list scanned visible controls, candidates before exclusions, intentionally skipped full-filter overlay controls, excluded action controls, remaining dropdown candidates, opened dropdowns, and skipped candidates.

Each opened or inspected dropdown writes:

```text
ui-audit/dropdown-audit-runs/<TIMESTAMP>/pages/<area>/<page>/<state>/filter-dropdowns/<NN>-<dropdown-slug>/
```

The dropdown run summary is written to:

```text
ui-audit/dropdown-audit-runs/<TIMESTAMP>/SUMMARY.md
```

Hidden states outside filter dropdowns still require the normal manual `capture-current` command after `npm run ui:audit`.

## Predefined-Filter Audit

`npm run ui:audit:predefined-filters` is a controlled filter audit for explicitly configured list-view routes and filter labels. It does not use `scripts/ui-audit.routes.local.json`; it loads:

```text
scripts/ui-audit.predefined-filters.local.json
```

For each configured page, it navigates by URL and inspects each configured filter one at a time from a clean page state. It never clicks the blocking `alle Filter` / `all filters` quick button and never clicks apply, reset, save, delete, row actions, detail links, navigation tabs, or category tabs.

Standard dropdown filters are opened only by their trigger inside the matched filter container. The utility inspects the rendered option elements inside the active dropdown container and does not select any option.

Searchable dropdown filters use the configured safe search value `1`, inspect the rendered result options, and do not press Enter or click the search icon.

If a dropdown contains `weitere anzeigen`, the utility clicks it only inside the active dropdown option container, only while the visible option count increases, and never more than the configured safety limit.

Each predefined-filter run creates a new timestamped folder:

```text
ui-audit/predefined-filter-audit-runs/<TIMESTAMP>/
```

For each configured filter it writes:

```text
ui-audit/predefined-filter-audit-runs/<TIMESTAMP>/pages/<area>/<page>/filters/<NN>-<filter-slug>/
```

Previous audit output remains unchanged. Internal URLs and generated audit output must remain local and ignored by Git.

## Final Summary

When you are done with manual captures, type:

```text
finish
```

This creates:

```text
ui-audit/summary/IMPROVEMENTS.md
```

## Never Commit

These local files and folders must never be committed:

```text
.audit-profile/
ui-audit/
scripts/ui-audit.routes.local.json
scripts/ui-audit.predefined-filters.local.json
```

Run this utility only against the approved INT environment.
