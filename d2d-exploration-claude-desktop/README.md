# Door 2 Door exploratory-test artifacts

- `application-map.html` — interactive expandable application tree and rendered Mermaid overview.
- `application-map.mmd` — detailed Mermaid source.
- `findings.md` — defects, risks, verified behavior, and safety exclusions.
- `action-log.md` — chronological exploration record.
- `automation-framework-proposal.md` — recommended Playwright/TypeScript architecture, layers, repository structure, test strategy, and implementation roadmap.
- `raw-dom/README.md` — manifest for 97 full, state-specific accessible-DOM captures.
- `raw-dom/*.dom.txt` — unabridged DOM snapshots captured after page loads, filters, context menus, drawers, tabs, modals, edit forms, and embedded widget actions.
- `00-baseline.dom.yaml` — initial accessible DOM structure.
- `01-baulose-sales.dom.yaml` — Baulose, Sales Action, filter modal, drawers, and embedded workflows.
- `02-objekte.dom.yaml` — Objekte lists, filters, and detail states.
- `03-admin-import-config.dom.yaml` — User Administration, Imports, and Configuration states.

The four YAML files are normalized summaries. The `raw-dom/` directory is the unabridged archive requested in the follow-up pass; repeated shell content and full visible table bodies are retained in every state.

## List-view interaction model

- **Baulose:** FTTH and Bestandsbau render list/table rows. The rows are not directly clickable; the row-level `zu Sales Actions` button redirects to a filtered Sales Action list.
- **Objekte:** Neubau, FTTH-Ausbau and Bestandsbau each render object list items. A direct item click opens the type-specific side panel; the row's three-dot control opens a context menu with additional actions.
- **Sales Action:** all three sections render Sales Action list items. Clicking a result item directly opens its type-specific side panel, whose buttons and tabs trigger the recorded modals, editors and embedded widgets.
- **Benutzerverwaltung:** Benutzer, Teams and Organisationen are list views. Clicking an item opens its corresponding side panel; editing is triggered from inside that panel.
- **Importe:** imports are displayed as table rows with contextual row actions such as `Rückgängig machen`; page-level buttons open the import and organization-switch workflows.

No destructive or committing action was executed.
