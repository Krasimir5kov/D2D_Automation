# Door 2 Door exploratory test action log

Target: `https://portal-int.open-frontends.a1.net/door2door#/baulose/ftth`

Safety boundary: exploratory/read-only interactions only. No save, delete, submit, upload, send, permission, or other irreversible action was executed.

## Baseline

1. Claimed the already-open authenticated tab.
2. Captured the complete accessible DOM baseline.
3. Identified primary sections, Baulose sub-tabs, filters, list rows, pagination, and session-expiry warning.

## Baulose

4. Tested the page-size option 50; the visible value remained 25.
5. Opened Organisation, selected Network Nord, captured checked state, applied it, captured skeleton and settled one-row states, then removed all filters.
6. Opened Regime (empty result), Phase (loading and loaded states), Status, and expanded the additional Status value.
7. Switched from FTTH-AUSBAU to BESTANDSBAU and captured its distinct table schema.
8. Activated the first Baulos `zu Sales Actions` control.

## Sales Action

9. Captured loading and settled states for a 467-row filtered result set.
10. Opened `alle Filter` and expanded Regime, Immobilienart, Status, Aufgabe, Ergebnis (including 73 additional values), Planskizze, Bestellung, consent, consent document, customer data, Sales Action type, and Upselling Potential.
11. Closed the modal without applying draft filter changes.
12. Traversed the horizontal filter strip to the right and back to the left, capturing a DOM snapshot after every step.
13. Opened Sales Action 285029 and captured its detail drawer.
14. Opened activity creation, exercised one radio state, and cancelled.
15. Opened note creation and cancelled.
16. Opened order capture, inspected product availability and address editing, switched to Location ID mode, cancelled address editing, and closed the workflow.
17. Opened appointment booking, captured its full form, and closed it without submission.
18. Opened the Activities tab, inspected activity/appointment sections, opened inline activity edit, and cancelled.
19. Left `Aktivität löschen` untouched because it is destructive.

## Objekte

20. Opened Objekte and captured loading and settled Neubau states plus tab counts.
21. Opened and closed the all-filters modal.
22. Opened Objekt 134555 and inspected Übersicht, Fragebogen, D2D Verkauf, and Objekt SA tabs.
23. Opened inline Verkaufsstart edit and note forms; cancelled both.

## Benutzerverwaltung

24. Captured Benutzer, Teams, and Organisationen states.
25. Opened and cancelled Benutzer, Team, and Admin A1 creation forms.

## Importe

26. Captured the 1,386-record import list and filters.
27. Opened and cancelled CSV import and organisation-switch workflows.
28. Left `Rückgängig machen` untouched because it is destructive.

## Konfiguration

29. Captured Overview, Completion Reasons (177), Tasks (54), Groups (103), Regime (34), and Activities Setup (10).
30. Checked accumulated browser warnings/errors and classified the portal-related A1 Store failure separately from extension errors.

## Follow-up gap-closing pass

31. Re-captured Baulose FTTH/Bestandsbau lists, real search results, four quick-filter popovers, and the `zu Sales Actions` redirect as unabridged DOM files.
32. Inspected the three Objekte sections independently, including each first-row three-dot menu and its distinct drawer. Captured questionnaire, D2D Verkauf, Objekt Sales Action, edit, note, rejection, and all-filter states.
33. Cleared inherited Sales Action filters before each section, opened Sales Action-Type, applied the first option, then applied a representative D2D filter and captured the resulting lists.
34. Opened Neubau object-level and door-level Sales Action drawers; captured the four-outcome activity dialog, assignment editor, and activities tab.
35. Opened an FTTH drawer and captured its eleven-outcome activity dialog, Planskizze widget, order widget, appointment widget, assignment editor, activities, documents, and order-status tabs.
36. Opened a Bestandsbau drawer and captured its three-outcome activity dialog, order widget, appointment widget, assignment editor, and activities tab.
37. Opened representative user, team, and organization drawers; opened and cancelled the user and team edit forms.
38. Captured Import date, organization, and user filters; organization-switch modal; and the four-step CSV import wizard.
39. Revisited all six Configuration sections and captured available completion-reason, task, regime, and setup create controls; cancelled every form that opened.
40. Produced a 97-state raw DOM manifest and refreshed the Mermaid/HTML application maps and findings.
