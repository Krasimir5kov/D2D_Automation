import json, os

BASE = "/sessions/sweet-optimistic-turing/mnt/D2D-Exploration/konfiguration"
SRC_OV = "/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/configuration/overview/default"
SRC_OUT = "/sessions/sweet-optimistic-turing/mnt/Inspect d2d DOM/ui-audit/pages/configuration/outcomes/default"

# ── helpers ────────────────────────────────────────────────────────────────────

def parse_a11y(path):
    with open(path) as f:
        d = json.load(f)
    return d.get("violations", []), d.get("passes", []), d.get("incomplete", [])

def parse_elements(path):
    with open(path) as f:
        d = json.load(f)
    return d.get("elements", [])

def build_table(elements):
    rows, quality_issues, missing_stable = [], [], []
    for i, e in enumerate(elements):
        label    = (e.get("visibleText") or "")[:50]
        tag      = e.get("tag") or ""
        test_id  = e.get("dataTestId") or ""
        aria     = e.get("ariaLabel") or ""
        eid      = e.get("id") or ""
        name     = e.get("name") or ""
        has_tid  = "yes" if test_id else "no"
        has_aria = "yes" if aria     else "no"
        has_id   = "yes" if eid      else "no"
        has_name = "yes" if name     else "no"
        stable   = "YES" if (test_id or aria or eid) else "NO"
        if test_id:
            loc = '[data-testid="%s"]' % test_id
        elif aria:
            loc = '[aria-label="%s"]' % aria[:40]
        elif eid:
            loc = "#" + eid
        else:
            loc = "/* NEEDS STABLE LOCATOR */"
            missing_stable.append("- Row %d: `%s` (%s)" % (i+1, label or "(no text)", tag))
        if stable == "NO":
            quality_issues.append("- Row %d: `%s` (%s) — no testid/aria/id, relies on CSS class or position" % (i+1, label or "(no text)", tag))
        rows.append("| %d | %s | %s | %s | %s | %s | %s | %s | `%s` |" % (
            i+1, label, tag, has_tid, has_aria, has_id, has_name, stable, loc))
    return rows, quality_issues, missing_stable

def read_improvements(path):
    with open(path) as f:
        return f.read()

def dom_excerpt(path, chars=3000):
    with open(path) as f:
        content = f.read()
    start = content.find("<body")
    if start < 0:
        start = 0
    return content[start:start+chars]

# ── UEBERSICHT ─────────────────────────────────────────────────────────────────

viols_ov, passes_ov, incomplete_ov = parse_a11y(SRC_OV + "/accessibility-report.json")
elems_ov = parse_elements(SRC_OV + "/interactive-elements.json")
rows_ov, qi_ov, ms_ov = build_table(elems_ov)
improvements_ov = read_improvements(SRC_OV + "/IMPROVEMENTS.md")
dom_ov = dom_excerpt(SRC_OV + "/sanitized-dom.html")

stable_ov = sum(1 for r in rows_ov if "| YES |" in r)

a11y_table_ov = "\n".join(
    "| `%s` | %s | %s | %d |" % (v["id"], v["impact"], v["description"][:80], len(v.get("nodes",[])))
    for v in viols_ov
)

uebers_a11y = """# DOM & Accessibility — Konfiguration / Übersicht

## Source
- `{src}/accessibility-report.json`
- `{src}/sanitized-dom.html`
- `{src}/IMPROVEMENTS.md`

## Accessibility Tree

**Summary:** {nv} violations, {np} passes, {ni} incomplete

### Violations

| Rule | Impact | Description | Nodes |
|------|--------|-------------|-------|
{vtable}

### Key Findings
- **Critical:** Logo `<img>` has no alt text (`image-alt`, 1 node).
- **Serious:** `<html>` tag missing `lang` attribute; 2 color-contrast failures.
- **Moderate:** No `<h1>` heading on page; 2 content regions outside landmark elements.
- **Passes:** {np} rules passed — basic ARIA roles, form labels, keyboard navigation.

## Key DOM Structure

```html
{dom}
```

## Page Notes

{improvements}
""".format(
    src=SRC_OV,
    nv=len(viols_ov), np=len(passes_ov), ni=len(incomplete_ov),
    vtable=a11y_table_ov,
    dom=dom_ov,
    improvements=improvements_ov
)

with open(BASE + "/uebersicht/dom-accessibility.md", "w", encoding="utf-8") as f:
    f.write(uebers_a11y)
print("wrote uebersicht/dom-accessibility.md")

# ── UEBERSICHT buttons-locators ────────────────────────────────────────────────

uebers_btn = """# Buttons & Locators — Konfiguration / Übersicht

## Button Inventory

| # | Visible Label | Tag | Has data-testid | Has aria-label | Has id | Has name | Stable Locator? | Recommended Locator |
|---|---|---|---|---|---|---|---|---|
{rows}

**Totals:** {total} elements — {stable} stable ({pct}%), {unstable} unstable

## Locator Quality Issues

{qi}

**Note for named links:** Playwright `page.getByRole('link', {{ name: /text/i }})` gives a
reasonably stable fallback for rows 3–21 even without a data-testid.

## Missing Stable Attributes

{ms}

**Priority additions:**
- Row 22 `(no text)` div — no visible text either; needs aria-label AND data-testid to be testable at all.
- Rows 1–2 (`Widget Versions`, `Abmelden`) — add `data-testid="nav-widget-versions"` / `data-testid="nav-logout"`.
- Rows 16–21 Konfiguration sub-nav tabs — add `data-testid="konfig-tab-uebersicht"` etc.
""".format(
    rows="\n".join(rows_ov),
    total=len(rows_ov),
    stable=stable_ov,
    pct=round(stable_ov/len(rows_ov)*100) if rows_ov else 0,
    unstable=len(rows_ov)-stable_ov,
    qi="\n".join(qi_ov) if qi_ov else "None.",
    ms="\n".join(ms_ov) if ms_ov else "None."
)

with open(BASE + "/uebersicht/buttons-locators.md", "w", encoding="utf-8") as f:
    f.write(uebers_btn)
print("wrote uebersicht/buttons-locators.md")

# ── ABSCHLUSSGRUENDE ───────────────────────────────────────────────────────────

viols_out, passes_out, incomplete_out = parse_a11y(SRC_OUT + "/accessibility-report.json")
elems_out = parse_elements(SRC_OUT + "/interactive-elements.json")
rows_out, qi_out, ms_out = build_table(elems_out)
improvements_out = read_improvements(SRC_OUT + "/IMPROVEMENTS.md")
dom_out = dom_excerpt(SRC_OUT + "/sanitized-dom.html")

stable_out = sum(1 for r in rows_out if "| YES |" in r)

a11y_table_out = "\n".join(
    "| `%s` | %s | %s | %d |" % (v["id"], v["impact"], v["description"][:80], len(v.get("nodes",[])))
    for v in viols_out
)

inc_table_out = "\n".join(
    "| `%s` | %s | %s | %d |" % (v["id"], v["impact"], v["description"][:80], len(v.get("nodes",[])))
    for v in incomplete_out
) if incomplete_out else "_None._"

abschl_a11y = """# DOM & Accessibility — Konfiguration / Abschlussgründe

## Source
- `{src}/accessibility-report.json`
- `{src}/sanitized-dom.html`
- `{src}/IMPROVEMENTS.md`

## Accessibility Tree

**Summary:** {nv} violations, {np} passes, {ni} incomplete

### Violations

| Rule | Impact | Description | Nodes |
|------|--------|-------------|-------|
{vtable}

### Incomplete (needs manual review)

| Rule | Impact | Description | Nodes |
|------|--------|-------------|-------|
{itable}

### Key Findings
- **Critical (×2):** Logo `<img>` missing alt text; 1 button with no discernible text label (`button-name`).
- **Serious — high volume:** 356 ARIA buttons/links/menuitems with no accessible name (`aria-command-name`) — icon-only row action buttons in the data table. 179 nested-interactive violations from table rows containing clickable children.
- **Serious — page level:** `<html>` missing `lang`; 4 color-contrast failures (up from 2 on Übersicht).
- **Moderate:** No `<h1>` heading; 2 content regions outside landmark elements.
- **Passes:** {np} rules passed (up from 29 on Übersicht — more elements tested across the full table).

## Key DOM Structure

```html
{dom}
```

## Page Notes

{improvements}
""".format(
    src=SRC_OUT,
    nv=len(viols_out), np=len(passes_out), ni=len(incomplete_out),
    vtable=a11y_table_out,
    itable=inc_table_out,
    dom=dom_out,
    improvements=improvements_out
)

with open(BASE + "/abschlussgruende/dom-accessibility.md", "w", encoding="utf-8") as f:
    f.write(abschl_a11y)
print("wrote abschlussgruende/dom-accessibility.md")

# ── ABSCHLUSSGRUENDE buttons-locators ─────────────────────────────────────────

# Table is 564 rows — write it all
abschl_btn = """# Buttons & Locators — Konfiguration / Abschlussgründe

## Button Inventory

| # | Visible Label | Tag | Has data-testid | Has aria-label | Has id | Has name | Stable Locator? | Recommended Locator |
|---|---|---|---|---|---|---|---|---|
{rows}

**Totals:** {total} elements — {stable} stable ({pct}%), {unstable} unstable

## Locator Quality Issues

{qi}

## Missing Stable Attributes

{ms}

**Priority additions:**
- 354 row action buttons (icon-only, no aria-label) — highest risk; add `aria-label` per row or `data-testid="row-action-{{id}}"`.
- 3 icon-only toolbar buttons — add `aria-label` describing the action (e.g. "Neuen Abschlussgrund anlegen").
- 4 generic `<div>` buttons — replace with native `<button>` and add `data-testid`.
- Search field — add `data-testid="abschlussgruende-search-input"`.
- Row 22 `(no text)` div — no visible text; needs aria-label AND data-testid.
""".format(
    rows="\n".join(rows_out),
    total=len(rows_out),
    stable=stable_out,
    pct=round(stable_out/len(rows_out)*100) if rows_out else 0,
    unstable=len(rows_out)-stable_out,
    qi="\n".join(qi_out) if qi_out else "None.",
    ms="\n".join(ms_out) if ms_out else "None."
)

with open(BASE + "/abschlussgruende/buttons-locators.md", "w", encoding="utf-8") as f:
    f.write(abschl_btn)
print("wrote abschlussgruende/buttons-locators.md")

print("ALL DONE")
