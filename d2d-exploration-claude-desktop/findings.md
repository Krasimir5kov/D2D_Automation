# Door 2 Door exploratory findings

Scope: authenticated integration portal, read-only exploratory testing of navigation, filters, lists, drawers, modals, inline forms, and embedded workflows. No destructive or externally committing action was executed.

## High-value observations

1. **Baulose Regime filter is empty while rows contain Regime values.** On FTTH Baulose, rows display `vULL 2.0` and `VHCN`, but opening the Regime filter returns `Kein Ergebnis gefunden`. This looks like a data-source or filter-population defect.

2. **Page-size control did not change from 25 to 50.** The accessibility DOM exposed menu items 25/50/100/500, but activating 50 left the control labeled 25. The same menu items persist in the DOM across pages, suggesting hidden or stale menu content is exposed and may be receiving clicks.

3. **A1 Store product lookup produced an application error.** During the embedded order/address workflow the console logged: `Error fetching internet products for postalCode: undefined` followed by `Internal Server Error`. This is the only captured error clearly tied to a portal microfrontend rather than a Chrome extension.

4. **Session-expiry banner remains at 00:00 while the application stays interactive.** Every captured state contained `Due to inactivity, the authentication will expire in 00:00`. Data loading and navigation continued. The countdown and actual session state appear out of sync.

5. **Many interactive controls are unlabeled or symbol-only.** Modal close buttons, table row actions, drawer controls, paging arrows, chip removal, and embedded workflow navigation frequently appear only as glyphs such as ``, ``, ``, or as unnamed buttons. This is a significant accessibility and automation reliability issue.

6. **Duplicate nested button semantics occur throughout filters.** Accordion headers are exposed as a button containing another button with the same accessible name. This creates ambiguous targets and can cause duplicate announcements in assistive technology.

7. **Loading states retain stale list metadata.** After applying an Organisation filter, the table renders 25 empty skeleton rows while the prior pagination text (`1-3 von 3`) remains. The settled state correctly changes to one record. This may confuse users on slow connections.

8. **Filter-strip navigation is asymmetric.** Reaching the right end required 12 additional right-arrow activations after the first steps, while returning to the start required 16 left-arrow activations. The final visible window was repeated once before the right arrow disappeared. The scroll-step calculation deserves review.

9. **Import undo actions have repeated non-contextual names.** Every import row exposes `Rückgängig machen` without including the import timestamp/file in its accessible name. This makes destructive row selection error-prone.

10. **Text quality issues are visible in production-facing labels.** Examples include `duchgeführt am` (missing `r`) and `Abschlussgrunde erstellen` (missing umlaut and awkward singular/plural form).

11. **Sales Action-Type filtering is visually inconsistent in FTTH and Bestandsbau.** After explicitly selecting and applying `D2D Verkauf`, the chip displays `Sales Action-Type (1)` / `D2D Verkauf`, but FTTH rows remain labeled `vULL 2.0` and Bestandsbau rows remain labeled `BBI-Push`; the total counts also remain unchanged. Raw reproductions: `raw-dom/83-sales-ftth-d2d-filtered-list.dom.txt` and `raw-dom/103-sales-bestandsbau-d2d-filtered-list.dom.txt`.

12. **The first Sales Action-Type option produces an empty state in all three sections.** Applying `Bauträger Übergabemappe` yielded no visible rows in Neubau, FTTH, and Bestandsbau. This may be valid data absence, but it makes the first-option filter path a poor default test fixture.

13. **Activities Setup create action has no observable result.** Clicking `Setup erstellen` marks the button active, but no dialog, drawer, form fields, or route change appears in the accessible DOM. Raw reproduction: `raw-dom/149-config-activities-setup-create-modal.dom.txt`.

14. **The three Sales Action activity dialogs are materially different.** Neubau D2D exposes four outcomes, FTTH exposes eleven infrastructure/product outcomes, and Bestandsbau exposes three outcomes. Treating them as one shared UI in tests would miss type-specific behavior.

15. **Embedded FTTH workflows accumulate as portal widget tiles.** Opening Planskizze, Bestellung, and Termin adds persistent tiles to the portal shell. Returning to the D2D tile restores the drawer, while clicking the symbol-only close control did not reliably dismiss the active widget.

## Behavior verified

- Baulose FTTH/Bestandsbau switching and representative filtering/reset.
- Sales Action all-filter modal, expanded Regime/Status/Aufgabe/Ergebnis and boolean categories.
- Horizontal filter-strip traversal in both directions.
- All three Sales Action list-to-drawer variants, type filtering, assignment editors, activity tabs, and type-specific activity outcome dialogs.
- FTTH Planskizze, order, appointment, documents, and order-status flows; Bestandsbau order and appointment flows.
- Embedded order-address and appointment workflows, including address-input/Location-ID modes and safe exit.
- Objekte tabs, all-filter modal, detail drawer, questionnaire, D2D Verkauf, Objekt SA, inline sales-start edit and note form.
- Benutzer, Teams, Organisationen lists, representative detail drawers, and user/team edit forms (cancelled).
- Import list, CSV-import wizard and organisation-switch wizard (cancelled).
- Configuration Overview, Completion Reasons, Tasks, Groups, Regime and Activities Setup, including available create forms (cancelled).

## Raw DOM archive

The follow-up pass produced 97 state-specific accessibility DOM files under `raw-dom/`. The manifest at `raw-dom/README.md` maps every file to the action/state that produced it.

## Deliberately not executed

- Save/create/apply actions that would persist records.
- User, team, Admin, completion-reason, task, regime or setup creation.
- Activity deletion, import undo, object rejection, organisation transfer, file upload, appointment creation, order placement, or any external ordering-system action.
- Authentication extension.

## Console classification

- Relevant: A1 Store product fetch with undefined postal code and Internal Server Error.
- Likely unrelated to the portal: repeated errors originating from Chrome extension content scripts and message channels.
