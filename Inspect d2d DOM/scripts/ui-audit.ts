import { AxeBuilder } from "@axe-core/playwright";
import { chromium, type Page } from "playwright";
import { promises as fs } from "node:fs";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";

const CAPTURE_SCREENSHOTS = false;
const PROFILE_DIR = path.resolve(process.cwd(), ".audit-profile");
const ROUTES_FILE = path.resolve(process.cwd(), "scripts/ui-audit.routes.local.json");
const PREDEFINED_FILTERS_FILE = path.resolve(process.cwd(), "scripts/ui-audit.predefined-filters.local.json");
const AUDIT_ROOT = path.resolve(process.cwd(), "ui-audit");
const PAGES_ROOT = path.join(AUDIT_ROOT, "pages");
const SUMMARY_FILE = path.join(AUDIT_ROOT, "summary", "IMPROVEMENTS.md");
const NETWORK_IDLE_TIMEOUT_MS = 8000;
const SETTLE_DELAY_MS = 1500;
const MAX_DROPDOWNS_PER_ROUTE = 30;
const MAX_SHOW_MORE_CLICKS = 10;
const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  "input",
  "textarea",
  "select",
  "option",
  "[role]",
  "[tabindex]",
  "summary",
  '[contenteditable="true"]',
].join(", ");

const DROPDOWN_CANDIDATE_DETECTION_SCRIPT = String.raw`() => {
  const ACTION_TEXT = /\b(search|suchen|sort|sortieren|apply|anwenden|reset|zurucksetzen|save|speichern|delete|loschen|edit|bearbeiten|create|erstellen|add|hinzufugen|submit|send|senden|import|export|details|info|navigation|user menu|benutzermenu|profile|profil)\b/i;
  const FILTER_TERMS = [
    "filter",
    "status",
    "organisation",
    "organization",
    "baulos",
    "einsatzname",
    "plz",
    "regime",
    "aufgabe",
    "ergebnis",
    "termin",
    "immobilienart",
    "phase",
    "kundendaten",
    "sales action",
    "planskizze",
    "bestellung"
  ];
  const MAX_LABEL = 140;

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function separatorKey(value) {
    return normalize(value).replace(/[\s_-]+/g, "-").replace(/^-|-$/g, "");
  }

  function redact(value) {
    return String(value || "")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED]")
      .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, "[REDACTED]")
      .replace(/\b\d{5,}\b/g, "[REDACTED]")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_LABEL);
  }

  function visibleText(element) {
    return redact(element.innerText || element.textContent || "");
  }

  function labelishText(element) {
    return [
      element.innerText,
      element.textContent,
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("placeholder"),
      element.getAttribute("name"),
      element.getAttribute("id"),
      element.getAttribute("data-testid")
    ].filter(Boolean).join(" ");
  }

  function combinedText(element) {
    return normalize([
      labelishText(element),
      Array.from(element.classList).join(" "),
      ancestorContext(element)
    ].filter(Boolean).join(" "));
  }

  function isVisible(element) {
    if (element instanceof HTMLOptionElement) return true;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/(["'\\.#:[\]>+~*^$|= ])/g, "\\$1");
  }

  function cssPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      const id = current.getAttribute("id");
      if (id) {
        parts.unshift(tag + "#" + cssEscape(id));
        break;
      }

      let part = tag;
      const testId = current.getAttribute("data-testid");
      if (testId) {
        part += '[data-testid="' + testId.replace(/"/g, '\\"') + '"]';
      } else {
        const classes = Array.from(current.classList).slice(0, 2);
        if (classes.length) part += "." + classes.map(cssEscape).join(".");
        const parent = current.parentElement;
        if (parent) {
          const sameTag = Array.from(parent.children).filter((sibling) => sibling.tagName === current.tagName);
          if (sameTag.length > 1) part += ":nth-of-type(" + (sameTag.indexOf(current) + 1) + ")";
        }
      }

      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function diagnosticPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      let part = tag;
      const id = current.getAttribute("id");
      if (id) part += "#" + id;
      const classes = Array.from(current.classList).slice(0, 3);
      if (classes.length) part += "." + classes.join(".");
      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function ancestorContext(element) {
    const chunks = [];
    let current = element;
    for (let depth = 0; current && depth < 5; depth += 1) {
      chunks.push([
        current.getAttribute("id"),
        current.getAttribute("data-testid"),
        current.getAttribute("aria-label"),
        current.getAttribute("title"),
        Array.from(current.classList).join(" ")
      ].filter(Boolean).join(" "));
      current = current.parentElement;
    }
    return chunks.join(" ");
  }

  function associatedLabel(element) {
    const id = element.getAttribute("id");
    if (id) {
      const label = document.querySelector('label[for="' + cssEscape(id) + '"]');
      if (label) return label.textContent || "";
    }
    const wrapper = element.closest("label");
    return wrapper ? wrapper.textContent || "" : "";
  }

  function hasFilterTerm(element) {
    const haystack = normalize([
      labelishText(element),
      associatedLabel(element),
      ancestorContext(element)
    ].filter(Boolean).join(" "));
    return FILTER_TERMS.some((term) => haystack.includes(term));
  }

  function isHardExcludedOverlayOpener(element) {
    const key = separatorKey(labelishText(element));
    return (
      key.includes("alle-filter-entfernen") ||
      key.includes("filter-anwenden") ||
      key.includes("all-filters") ||
      key.includes("alle-filter")
    );
  }

  function isRowOrNavigation(element) {
    const role = element.getAttribute("role");
    const tag = element.tagName.toLowerCase();
    return Boolean(
      element.closest("nav,header,footer,[role='tablist'],[role='navigation']") ||
      role === "tab" ||
      tag === "a" ||
      (element.closest("tr,[role='row']") && !hasFilterTerm(element))
    );
  }

  function classify(element) {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    const ariaHasPopup = element.getAttribute("aria-haspopup");
    if (tag === "select") return "native select";
    if (role === "combobox") return "combobox";
    if (role === "listbox") return "listbox";
    if (ariaHasPopup === "menu") return "menu";
    if (ariaHasPopup === "listbox") return "listbox";
    return "uncertain custom dropdown";
  }

  function buildItem(element, index, reason) {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    const label = visibleText(element);
    return {
      index,
      label,
      accessibleName: redact(element.getAttribute("aria-label") || associatedLabel(element) || element.getAttribute("title") || label),
      selector: cssPath(element),
      tag,
      role,
      id: element.getAttribute("id"),
      dataTestId: element.getAttribute("data-testid"),
      title: element.getAttribute("title"),
      ariaLabel: element.getAttribute("aria-label"),
      ariaHasPopup: element.getAttribute("aria-haspopup"),
      ariaControls: element.getAttribute("aria-controls"),
      ariaExpanded: element.getAttribute("aria-expanded"),
      classList: Array.from(element.classList),
      diagnosticDomPath: diagnosticPath(element),
      kind: classify(element),
      inFilterContainer: hasFilterTerm(element),
      reason
    };
  }

  function candidateReason(element) {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    const ariaHasPopup = element.getAttribute("aria-haspopup");
    const nativeOrCombobox = tag === "select" || role === "combobox";
    const buttonLike = tag === "button" || role === "button";
    const hasPopupSignal = ["listbox", "menu", "true"].includes(ariaHasPopup || "");
    const hasStateSignal = element.hasAttribute("aria-expanded") || element.hasAttribute("aria-controls");
    if (nativeOrCombobox) return "Native select or combobox.";
    if (hasPopupSignal) return "Has aria-haspopup dropdown signal.";
    if (buttonLike && hasFilterTerm(element)) return "Button-like control inside a filter-related region.";
    if (hasStateSignal && hasFilterTerm(element)) return "Filter-related control has aria-expanded or aria-controls.";
    return "";
  }

  const selector = [
    "select",
    "button",
    "a[href]",
    "[role='button']",
    "[role='combobox']",
    "[aria-haspopup]",
    "[aria-expanded]",
    "[aria-controls]",
    "[role='tab']"
  ].join(",");

  const visibleScanned = [];
  const candidatesBeforeExclusions = [];
  const hardExcludedOverlayOpeners = [];
  const excludedActionControls = [];
  const candidates = [];
  const skipped = [];
  const seen = new Set();
  const rawControls = Array.from(document.querySelectorAll(selector));

  for (const raw of rawControls) {
    if (!isVisible(raw)) continue;
    const element = raw.closest("select,button,a[href],[role='button'],[role='combobox'],[aria-haspopup],[aria-expanded],[aria-controls],[role='tab']") || raw;
    if (!isVisible(element)) continue;
    const selectorPath = cssPath(element);
    if (!selectorPath || seen.has(selectorPath)) continue;
    seen.add(selectorPath);

    const scannedItem = buildItem(element, visibleScanned.length, "");
    visibleScanned.push(scannedItem);
    const reason = candidateReason(element);
    if (!reason) {
      continue;
    }

    const item = buildItem(element, candidatesBeforeExclusions.length, reason);
    candidatesBeforeExclusions.push(item);
    const combined = combinedText(element);

    if (isHardExcludedOverlayOpener(element)) {
      const excluded = { ...item, reason: "Skipped intentionally: blocking full-filters overlay opener" };
      hardExcludedOverlayOpeners.push(excluded);
      skipped.push(excluded);
      continue;
    }

    if (ACTION_TEXT.test(combined)) {
      const excluded = { ...item, reason: "Excluded action control; dropdown audit must not search, sort, apply, reset, save, delete, edit, create, import, export, or open details." };
      excludedActionControls.push(excluded);
      skipped.push(excluded);
      continue;
    }

    if (isRowOrNavigation(element)) {
      skipped.push({ ...item, reason: "Excluded link, tab, navigation, category navigation, row action, or side-panel/detail opener." });
      continue;
    }

    if (!item.inFilterContainer && item.kind === "uncertain custom dropdown" && !["listbox", "menu", "true"].includes(item.ariaHasPopup || "")) {
      skipped.push({ ...item, reason: "Uncertain dropdown-like control outside a filter-related region." });
      continue;
    }

    candidates.push({ ...item, index: candidates.length });
  }

  return {
    visibleScanned,
    candidatesBeforeExclusions,
    hardExcludedOverlayOpeners,
    excludedActionControls,
    candidates,
    skipped
  };
}`;

const VISIBLE_DROPDOWN_OPTIONS_SCRIPT = String.raw`() => {
  const MAX_TEXT = 180;

  function redact(value) {
    return String(value || "")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED]")
      .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, "[REDACTED]")
      .replace(/\b\d{5,}\b/g, "[REDACTED]")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_TEXT);
  }

  function isVisible(element) {
    if (element instanceof HTMLOptionElement) return true;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function escapeRegexText(value) {
    return String(value || "").replace(/[.*+?^$()|[\]\\]/g, "\\$&").replace(/[{}]/g, "\\$&");
  }

  const selector = [
    "option",
    "[role='option']",
    "[role='menuitem']",
    "[role='menuitemcheckbox']",
    "[role='menuitemradio']",
    ".option",
    "[class*='option' i]"
  ].join(",");

  const options = [];
  const seen = new Set();
  for (const element of Array.from(document.querySelectorAll(selector))) {
    if (!isVisible(element)) continue;
    const text = redact(element.innerText || element.textContent || element.getAttribute("aria-label") || element.getAttribute("title") || "");
    const key = element.tagName + "|" + text + "|" + options.length;
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      index: options.length,
      text,
      tag: element.tagName.toLowerCase(),
      role: element.getAttribute("role"),
      id: element.getAttribute("id"),
      dataTestId: element.getAttribute("data-testid"),
      classList: Array.from(element.classList),
      ariaSelected: element.getAttribute("aria-selected"),
      ariaChecked: element.getAttribute("aria-checked"),
      valuePresent: element.hasAttribute("value"),
      locator: element.getAttribute("data-testid")
        ? "page.getByTestId(" + JSON.stringify(element.getAttribute("data-testid")) + ")"
        : text
          ? "page.getByRole('" + (element.getAttribute("role") || "option") + "', { name: /" + escapeRegexText(text) + "/i })"
          : "Use a scoped locator from the dropdown trigger"
    });
  }
  return options;
}`;

const VISIBLE_DROPDOWN_SIGNATURE_SCRIPT = String.raw`() => {
  function normalize(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 180);
  }

  function isVisible(element) {
    if (element instanceof HTMLOptionElement) return true;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  const popupSelector = [
    "[role='listbox']",
    "[role='menu']",
    "[role='tree']",
    "[role='grid']",
    "[aria-modal='true']",
    "[class*='dropdown' i]",
    "[class*='popover' i]",
    "[class*='popup' i]",
    "[class*='menu' i]"
  ].join(",");
  const optionSelector = [
    "option",
    "[role='option']",
    "[role='menuitem']",
    "[role='menuitemcheckbox']",
    "[role='menuitemradio']",
    ".option",
    "[class*='option' i]"
  ].join(",");

  const visiblePopups = Array.from(document.querySelectorAll(popupSelector)).filter(isVisible);
  const visibleOptions = Array.from(document.querySelectorAll(optionSelector)).filter(isVisible);
  const signature = [...visiblePopups, ...visibleOptions]
    .map((element) => [
      element.tagName.toLowerCase(),
      element.getAttribute("role") || "",
      element.getAttribute("id") || "",
      element.getAttribute("data-testid") || "",
      normalize(element.textContent || element.getAttribute("aria-label") || "")
    ].join("|"))
    .join("\n");

  return {
    optionCount: visibleOptions.length,
    popupCount: visiblePopups.length,
    signature
  };
}`;

const BLOCKING_FILTER_OVERLAY_VISIBLE_SCRIPT = String.raw`() => {
  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  function key(value) {
    return normalize(value).replace(/[\s_-]+/g, "-").replace(/^-|-$/g, "");
  }

  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  const overlaySelector = [
    "[role='dialog']",
    "[aria-modal='true']",
    "[class*='overlay' i]",
    "[class*='modal' i]",
    "[class*='dialog' i]",
    "[class*='drawer' i]"
  ].join(",");

  for (const element of Array.from(document.querySelectorAll(overlaySelector))) {
    if (!isVisible(element)) continue;
    const text = key([
      element.textContent,
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("data-testid"),
      element.getAttribute("id")
    ].filter(Boolean).join(" "));
    if (
      text.includes("alle-filter") ||
      text.includes("all-filters") ||
      text.includes("filter-anwenden") ||
      text.includes("alle-filter-entfernen")
    ) {
      return true;
    }
  }

  return false;
}`;

const PREDEFINED_FIND_FILTER_SCRIPT = String.raw`config => {
  const MAX_TEXT = 180;
  const MAX_SNIPPET = 900;
  const ACTION_TEXT = /\b(search|suchen|sort|sortieren|apply|anwenden|reset|zurucksetzen|save|speichern|delete|loschen|edit|bearbeiten|create|erstellen|add|hinzufugen|submit|send|senden|import|export|details|info|navigation|user menu|benutzermenu|profile|profil)\b/i;

  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalize(value) {
    return compact(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function isShowMoreText(value) {
    const key = normalize(value);
    return key === "weitere anzeigen" || /^\d+\s+weitere anzeigen$/.test(key);
  }

  function separatorKey(value) {
    return normalize(value).replace(/[\s_-]+/g, "-").replace(/^-|-$/g, "");
  }

  function redact(value, max) {
    const clean = compact(value)
      .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED]")
      .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, "[REDACTED]")
      .replace(/\b\d{5,}\b/g, "[REDACTED]");
    return clean ? clean.slice(0, max || MAX_TEXT) : null;
  }

  function isVisible(element) {
    if (element instanceof HTMLOptionElement) return true;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/(["'\\.#:[\]>+~*^$|= ])/g, "\\$1");
  }

  function cssPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      const id = current.getAttribute("id");
      if (id) {
        parts.unshift(tag + "#" + cssEscape(id));
        break;
      }

      let part = tag;
      const testId = current.getAttribute("data-testid");
      if (testId) {
        part += '[data-testid="' + testId.replace(/"/g, '\\"') + '"]';
      } else {
        const classes = Array.from(current.classList).slice(0, 2);
        if (classes.length) part += "." + classes.map(cssEscape).join(".");
        const parent = current.parentElement;
        if (parent) {
          const sameTag = Array.from(parent.children).filter((sibling) => sibling.tagName === current.tagName);
          if (sameTag.length > 1) part += ":nth-of-type(" + (sameTag.indexOf(current) + 1) + ")";
        }
      }

      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function diagnosticPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      let part = tag;
      const id = current.getAttribute("id");
      if (id) part += "#" + id;
      const classes = Array.from(current.classList).slice(0, 3);
      if (classes.length) part += "." + classes.join(".");
      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function labelledByText(element) {
    const value = element.getAttribute("aria-labelledby");
    if (!value) return null;
    return redact(value.split(/\s+/).map(id => {
      const target = document.getElementById(id);
      return target ? target.textContent || "" : "";
    }).join(" "), MAX_TEXT);
  }

  function associatedLabelText(element) {
    if ("labels" in element && element.labels && element.labels.length) {
      return redact(Array.from(element.labels).map(label => label.textContent || "").join(" "), MAX_TEXT);
    }
    const id = element.getAttribute("id");
    if (id) {
      const labels = Array.from(document.querySelectorAll("label")).filter(label => label.htmlFor === id);
      if (labels.length) return redact(labels.map(label => label.textContent || "").join(" "), MAX_TEXT);
    }
    const closest = element.closest("label");
    return closest ? redact(closest.textContent || "", MAX_TEXT) : null;
  }

  function sanitizeAttribute(name, value) {
    const cleanName = name.toLowerCase();
    if (cleanName === "value") return "[REDACTED]";
    if (/(password|passwd|pwd|secret|token|cookie|authorization|auth|session|jwt|credential|saml|csrf|xsrf|code)/i.test(cleanName)) {
      return "[REDACTED]";
    }
    return redact(value, 240) || "";
  }

  function dataAttributes(element) {
    return Array.from(element.attributes).reduce((all, attribute) => {
      if (attribute.name.toLowerCase().startsWith("data-")) {
        all[attribute.name] = sanitizeAttribute(attribute.name, attribute.value || "");
      }
      return all;
    }, {});
  }

  function sanitizedSnippet(element) {
    const clone = element.cloneNode(true);
    for (const current of [clone, ...Array.from(clone.querySelectorAll("*"))]) {
      const tag = current.tagName.toLowerCase();
      if (tag === "script") current.textContent = "[REDACTED_SCRIPT_CONTENT]";
      if (current instanceof HTMLInputElement) current.setAttribute("value", "[REDACTED]");
      if (current instanceof HTMLTextAreaElement) current.textContent = "[REDACTED]";
      for (const attribute of Array.from(current.attributes)) {
        current.setAttribute(attribute.name, sanitizeAttribute(attribute.name, attribute.value || ""));
      }
    }
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      node.nodeValue = redact(node.nodeValue || "", MAX_TEXT) || "";
      node = walker.nextNode();
    }
    return compact(clone.outerHTML).slice(0, MAX_SNIPPET);
  }

  function elementInfo(element) {
    const tag = element.tagName.toLowerCase();
    const visible = redact(element.innerText || element.textContent || "", MAX_TEXT);
    const accessible = redact(element.getAttribute("aria-label"), MAX_TEXT) ||
      labelledByText(element) ||
      associatedLabelText(element) ||
      redact(element.getAttribute("title"), MAX_TEXT) ||
      redact(element.getAttribute("placeholder"), MAX_TEXT) ||
      visible;
    return {
      selector: cssPath(element),
      tag,
      type: element.getAttribute("type") ? sanitizeAttribute("type", element.getAttribute("type") || "") : null,
      role: element.getAttribute("role"),
      visibleText: visible,
      accessibleName: accessible,
      id: element.getAttribute("id") ? sanitizeAttribute("id", element.getAttribute("id") || "") : null,
      name: element.getAttribute("name") ? sanitizeAttribute("name", element.getAttribute("name") || "") : null,
      placeholder: element.getAttribute("placeholder") ? redact(element.getAttribute("placeholder"), MAX_TEXT) : null,
      title: element.getAttribute("title") ? redact(element.getAttribute("title"), MAX_TEXT) : null,
      classList: Array.from(element.classList),
      ariaLabel: element.getAttribute("aria-label") ? redact(element.getAttribute("aria-label"), MAX_TEXT) : null,
      ariaLabelledBy: element.getAttribute("aria-labelledby"),
      ariaDescribedBy: element.getAttribute("aria-describedby"),
      ariaExpanded: element.getAttribute("aria-expanded"),
      ariaControls: element.getAttribute("aria-controls"),
      dataTestId: element.getAttribute("data-testid") ? sanitizeAttribute("data-testid", element.getAttribute("data-testid") || "") : null,
      dataAttributes: dataAttributes(element),
      associatedLabelText: associatedLabelText(element),
      diagnosticDomPath: diagnosticPath(element),
      htmlSnippet: sanitizedSnippet(element)
    };
  }

  function isHardExcluded(element) {
    const key = separatorKey([
      element.innerText,
      element.textContent,
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("id"),
      element.getAttribute("data-testid")
    ].filter(Boolean).join(" "));
    return key.includes("alle-filter") || key.includes("all-filters") || key.includes("alle-filter-entfernen") || key.includes("filter-anwenden");
  }

  function isActionLike(element) {
    const tag = element.tagName.toLowerCase();
    const keyText = normalize([
      element.innerText,
      element.textContent,
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("id"),
      element.getAttribute("data-testid")
    ].filter(Boolean).join(" "));
    return tag === "a" ||
      element.getAttribute("role") === "tab" ||
      Boolean(element.closest("nav,header,footer,[role='tablist'],tr,[role='row']")) ||
      ACTION_TEXT.test(keyText) ||
      isHardExcluded(element);
  }

  function controlNameKeys(element) {
    return Array.from(new Set([
      element.innerText,
      element.textContent,
      element.getAttribute("aria-label"),
      element.getAttribute("title"),
      element.getAttribute("placeholder"),
      associatedLabelText(element)
    ].filter(Boolean).map(value => separatorKey(value)).filter(Boolean)));
  }

  function exactControlNameMatch(element) {
    return controlNameKeys(element).some(key => key === labelKey);
  }

  function partialControlNameMatch(element) {
    return controlNameKeys(element).some(key => key.includes(labelKey));
  }

  function candidateControls(container, type) {
    const selector = type === "searchable-dropdown"
      ? "input,textarea,select,button,[role='button'],[role='combobox'],[aria-haspopup],[aria-expanded],[aria-controls]"
      : "select,button,[role='button'],[role='combobox'],[aria-haspopup],[aria-expanded],[aria-controls]";
    return Array.from(container.querySelectorAll(selector)).filter((element) => isVisible(element) && !isActionLike(element));
  }

  function scoreControl(element, type) {
    const tag = element.tagName.toLowerCase();
    const role = element.getAttribute("role");
    let score = 0;
    if (type === "searchable-dropdown") {
      if (tag === "input") score += 80;
      if (role === "combobox") score += 40;
      if ((element.getAttribute("type") || "").toLowerCase() === "search") score += 20;
    } else {
      if (tag === "select") score += 100;
      if (role === "combobox") score += 90;
      if (element.getAttribute("aria-haspopup")) score += 60;
      if (element.hasAttribute("aria-expanded")) score += 50;
      if (element.hasAttribute("aria-controls")) score += 40;
      if (tag === "button" || role === "button") score += 30;
    }
    return score;
  }

  function possibleContainers(labelElement) {
    const containers = [];
    let current = labelElement;
    for (let depth = 0; current && depth < 7; depth += 1) {
      if (current instanceof HTMLElement) containers.push(current);
      current = current.parentElement;
    }
    return containers;
  }

  const labelKey = separatorKey(config.label);
  const labelText = normalize(config.label);
  const labelMatches = [];
  const visibleElements = Array.from(document.querySelectorAll("label,span,div,p,strong,b,legend,h1,h2,h3,h4,h5,h6"))
    .filter(isVisible);

  for (const element of visibleElements) {
    const ownText = compact(element.innerText || element.textContent || "");
    if (!ownText || ownText.length > 260) continue;
    const key = separatorKey(ownText);
    const normalized = normalize(ownText);
    if (key === labelKey || normalized === labelText || key.includes(labelKey)) {
      labelMatches.push({ element, exact: key === labelKey || normalized === labelText });
    }
  }

  const candidates = [];
  for (const match of labelMatches) {
    for (const container of possibleContainers(match.element)) {
      const controls = candidateControls(container, config.type);
      if (!controls.length) continue;
      const containerText = normalize(container.innerText || container.textContent || "");
      const labelDistanceScore = match.exact ? 200 : 120;
      for (const control of controls) {
        const exactControl = exactControlNameMatch(control);
        const partialControl = partialControlNameMatch(control);
        candidates.push({
          control,
          container,
          exactControl,
          partialControl,
          score:
            labelDistanceScore +
            scoreControl(control, config.type) +
            (exactControl ? 1000 : 0) +
            (!exactControl && partialControl ? 250 : 0) -
            Math.min(containerText.length / 300, 80)
        });
      }
    }
  }

  candidates.sort((a, b) => Number(b.exactControl) - Number(a.exactControl) || Number(b.partialControl) - Number(a.partialControl) || b.score - a.score);
  const deduped = [];
  const seen = new Set();
  for (const candidate of candidates) {
    const selector = cssPath(candidate.control);
    if (!selector || seen.has(selector)) continue;
    seen.add(selector);
    deduped.push(candidate);
  }

  if (deduped.length === 0) {
    return {
      found: false,
      reason: "Configured filter label or safe trigger was not found.",
      labelMatchCount: labelMatches.length,
      candidates: []
    };
  }

  const exactTriggerMatches = deduped.filter(candidate => candidate.exactControl);
  if (exactTriggerMatches.length === 1) {
    const best = exactTriggerMatches[0];
    return {
      found: true,
      reason: "Configured filter matched by exact trigger text or accessible name.",
      labelMatchCount: labelMatches.length,
      containerSelector: cssPath(best.container),
      trigger: elementInfo(best.control),
      candidates: deduped.slice(0, 8).map(candidate => elementInfo(candidate.control))
    };
  }

  if (exactTriggerMatches.length > 1) {
    return {
      found: false,
      reason: "More than one exact trigger matched this configured filter.",
      labelMatchCount: labelMatches.length,
      candidates: exactTriggerMatches.slice(0, 8).map(candidate => elementInfo(candidate.control))
    };
  }

  const bestScore = deduped[0].score;
  const tied = deduped.filter(candidate => Math.abs(candidate.score - bestScore) < 5);
  if (tied.length > 1) {
    return {
      found: false,
      reason: "More than one ambiguous trigger matched this configured filter.",
      labelMatchCount: labelMatches.length,
      candidates: tied.slice(0, 8).map(candidate => elementInfo(candidate.control))
    };
  }

  const best = deduped[0];
  return {
    found: true,
    reason: "Configured filter matched by nearby label and safe trigger.",
    labelMatchCount: labelMatches.length,
    containerSelector: cssPath(best.container),
    trigger: elementInfo(best.control),
    candidates: deduped.slice(0, 8).map(candidate => elementInfo(candidate.control))
  };
}`;

const PREDEFINED_VISIBLE_CONTAINERS_SCRIPT = String.raw`() => {
  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim().slice(0, 220);
  }

  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  const selector = [
    "[role='listbox']",
    "[role='menu']",
    "[role='tree']",
    "[role='grid']",
    "[class*='dropdown' i]",
    "[class*='popover' i]",
    "[class*='popup' i]",
    "[class*='menu' i]",
    "[class*='overlay' i]",
    "[style*='position: absolute' i]",
    "[style*='position:absolute' i]"
  ].join(",");

  return Array.from(document.querySelectorAll(selector))
    .filter(isVisible)
    .map((element) => [
      element.tagName.toLowerCase(),
      element.getAttribute("role") || "",
      element.getAttribute("id") || "",
      element.getAttribute("data-testid") || "",
      compact(element.textContent || element.getAttribute("aria-label") || "")
    ].join("|"));
}`;

const PREDEFINED_ACTIVE_CONTAINER_SCRIPT = String.raw`args => {
  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isVisible(element) {
    if (element instanceof HTMLOptionElement) return true;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/(["'\\.#:[\]>+~*^$|= ])/g, "\\$1");
  }

  function cssPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      const id = current.getAttribute("id");
      if (id) {
        parts.unshift(tag + "#" + cssEscape(id));
        break;
      }
      let part = tag;
      const testId = current.getAttribute("data-testid");
      if (testId) {
        part += '[data-testid="' + testId.replace(/"/g, '\\"') + '"]';
      } else {
        const classes = Array.from(current.classList).slice(0, 2);
        if (classes.length) part += "." + classes.map(cssEscape).join(".");
        const parent = current.parentElement;
        if (parent) {
          const sameTag = Array.from(parent.children).filter((sibling) => sibling.tagName === current.tagName);
          if (sameTag.length > 1) part += ":nth-of-type(" + (sameTag.indexOf(current) + 1) + ")";
        }
      }
      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function signature(element) {
    return [
      element.tagName.toLowerCase(),
      element.getAttribute("role") || "",
      element.getAttribute("id") || "",
      element.getAttribute("data-testid") || "",
      compact(element.textContent || element.getAttribute("aria-label") || "").slice(0, 220)
    ].join("|");
  }

  function optionCount(element) {
    const optionSelector = [
      "option",
      "[role='option']",
      "[role='menuitem']",
      "[role='menuitemcheckbox']",
      "[role='menuitemradio']",
      "li",
      "button",
      "[role='button']",
      "input[type='checkbox']",
      "input[type='radio']",
      "[aria-selected]",
      "[aria-checked]",
      "[class*='option' i]",
      "[class*='item' i]"
    ].join(",");
    return Array.from(element.querySelectorAll(optionSelector)).filter(isVisible).length;
  }

  function textKey(element) {
    return compact(element.innerText || element.textContent || element.getAttribute("aria-label") || "").toLowerCase();
  }

  function isActionText(element) {
    return /^(anwenden|zurucksetzen|zurücksetzen|reset|apply|filter anwenden)$/i.test(textKey(element));
  }

  function optionLikeCount(element) {
    const optionSelector = [
      "option",
      "[role='option']",
      "[role='menuitem']",
      "[role='menuitemcheckbox']",
      "[role='menuitemradio']",
      "input[type='checkbox']",
      "input[type='radio']",
      "[role='button']",
      "button",
      "label",
      "input:not([type='checkbox']):not([type='radio'])",
      "textarea",
      "[role='combobox']",
      "[class*='checkbox' i]"
    ].join(",");
    const seenTexts = new Set();
    let count = 0;
    for (const item of Array.from(element.querySelectorAll(optionSelector))) {
      if (!isVisible(item) || isActionText(item)) continue;
      const text = textKey(item);
      if (!args.allowInputOnly && ["input", "textarea"].includes(item.tagName.toLowerCase()) && !["checkbox", "radio"].includes((item.getAttribute("type") || "").toLowerCase())) continue;
      if (!text && item.tagName.toLowerCase() !== "input" && item.tagName.toLowerCase() !== "textarea") continue;
      const key = text || item.getAttribute("id") || item.getAttribute("name") || "";
      if (!key || seenTexts.has(key)) continue;
      seenTexts.add(key);
      count += 1;
    }
    return count;
  }

  function overlapsHorizontally(a, b) {
    return a.left < b.right && a.right > b.left;
  }

  function fallbackContainersNearTrigger(trigger) {
    if (!trigger) return [];
    const triggerRect = trigger.getBoundingClientRect();
    const triggerText = textKey(trigger);
    const optionSelector = args.allowInputOnly
      ? "input:not([type='checkbox']):not([type='radio']), textarea, [role='combobox']"
      : [
          "input[type='checkbox']",
          "input[type='radio']",
          "[role='button']",
          "button",
          "label",
          "[class*='checkbox' i]",
          "[aria-selected]",
          "[aria-checked]"
        ].join(",");
    const ancestors = new Map();
    for (const item of Array.from(document.querySelectorAll(optionSelector)).filter(isVisible)) {
      if (isActionText(item)) continue;
      const rect = item.getBoundingClientRect();
      if (rect.top < triggerRect.top - 20) continue;
      if (!overlapsHorizontally(rect, { left: triggerRect.left - 260, right: triggerRect.right + 520 })) continue;
      let current = item.parentElement;
      for (let depth = 0; current && depth < 8; depth += 1) {
        if (["HTML", "BODY", "MAIN"].includes(current.tagName)) break;
        if (!args.allowInputOnly && current.contains(trigger)) {
          current = current.parentElement;
          continue;
        }
        if (!isVisible(current)) {
          current = current.parentElement;
          continue;
        }
        const currentRect = current.getBoundingClientRect();
        const area = currentRect.width * currentRect.height;
        if (
          currentRect.top >= triggerRect.top - 30 &&
          currentRect.height > 40 &&
          currentRect.width > 80 &&
          area < window.innerWidth * window.innerHeight * 0.7
        ) {
          const key = cssPath(current);
          const count = optionLikeCount(current);
          const minimumCount = args.allowInputOnly ? 1 : 2;
          if (count >= minimumCount) {
            const existing = ancestors.get(key);
            const distance = Math.abs(currentRect.top - triggerRect.bottom) + Math.abs(currentRect.left - triggerRect.left);
            const currentText = textKey(current);
            const searchablePanelBoost =
              args.allowInputOnly && triggerText && currentText.includes(triggerText) && currentRect.height > 120 && currentRect.width > 180
                ? 1000
                : 0;
            const inputBoxPenalty = args.allowInputOnly && currentRect.height < 90 ? 400 : 0;
            const score = count * 100 + searchablePanelBoost - inputBoxPenalty - distance - area / 8000;
            if (!existing || score > existing.score) {
              ancestors.set(key, { element: current, count, distance, area, score });
            }
          }
        }
        current = current.parentElement;
      }
    }
    return Array.from(ancestors.values()).sort((a, b) => b.score - a.score);
  }

  const before = new Set(args.beforeSignatures || []);
  const trigger = args.triggerSelector ? document.querySelector(args.triggerSelector) : null;
  if (trigger && trigger.tagName.toLowerCase() === "select") {
    return {
      found: true,
      selector: args.triggerSelector,
      reason: "Native select options are available in the select element.",
      optionCount: optionCount(trigger),
      rawHtml: trigger.outerHTML
    };
  }

  const containerSelector = [
    "[role='listbox']",
    "[role='menu']",
    "[role='tree']",
    "[role='grid']",
    "[class*='dropdown' i]",
    "[class*='popover' i]",
    "[class*='popup' i]",
    "[class*='menu' i]",
    "[class*='overlay' i]",
    "[style*='position: absolute' i]",
    "[style*='position:absolute' i]"
  ].join(",");

  const candidates = Array.from(document.querySelectorAll(containerSelector))
    .filter(isVisible)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const triggerRect = trigger ? trigger.getBoundingClientRect() : null;
      const distance = triggerRect
        ? Math.abs(rect.top - triggerRect.bottom) + Math.abs(rect.left - triggerRect.left)
        : 0;
      const count = optionCount(element);
      return { element, count, isNew: !before.has(signature(element)), distance };
    })
    .filter(candidate => candidate.count > 0)
    .sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.count - a.count || a.distance - b.distance);

  if (!candidates.length) {
    const fallback = fallbackContainersNearTrigger(trigger);
    if (fallback.length) {
      const bestFallback = fallback[0];
      return {
        found: true,
        selector: cssPath(bestFallback.element),
        reason: "Visible checkbox/button-style option container detected near the configured trigger.",
        optionCount: bestFallback.count,
        rawHtml: bestFallback.element.outerHTML
      };
    }

    return {
      found: false,
      reason: "No visible active dropdown option container was detected after opening.",
      optionCount: 0
    };
  }

  const best = candidates[0];
  return {
    found: true,
    selector: cssPath(best.element),
    reason: best.isNew ? "Newly visible option container detected." : "Visible option container detected near the configured trigger.",
    optionCount: best.count,
    rawHtml: best.element.outerHTML
  };
}`;

const PREDEFINED_EXTRACT_OPTIONS_SCRIPT = String.raw`args => {
  const MAX_TEXT = 180;
  const MAX_SNIPPET = 900;

  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalize(value) {
    return compact(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function redact(value, max) {
    const clean = compact(value)
      .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]")
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED]")
      .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, "[REDACTED]")
      .replace(/\b\d{5,}\b/g, "[REDACTED]");
    return clean ? clean.slice(0, max || MAX_TEXT) : null;
  }

  function isVisible(element) {
    if (element instanceof HTMLOptionElement) return true;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/(["'\\.#:[\]>+~*^$|= ])/g, "\\$1");
  }

  function cssPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      const id = current.getAttribute("id");
      if (id) {
        parts.unshift(tag + "#" + cssEscape(id));
        break;
      }
      let part = tag;
      const testId = current.getAttribute("data-testid");
      if (testId) {
        part += '[data-testid="' + testId.replace(/"/g, '\\"') + '"]';
      } else {
        const parent = current.parentElement;
        if (parent) {
          const sameTag = Array.from(parent.children).filter((sibling) => sibling.tagName === current.tagName);
          if (sameTag.length > 1) part += ":nth-of-type(" + (sameTag.indexOf(current) + 1) + ")";
        }
      }
      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function diagnosticPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      let part = tag;
      const id = current.getAttribute("id");
      if (id) part += "#" + id;
      const classes = Array.from(current.classList).slice(0, 3);
      if (classes.length) part += "." + classes.join(".");
      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  function sanitizeAttribute(name, value) {
    const cleanName = name.toLowerCase();
    if (cleanName === "value") return "[REDACTED]";
    if (/(password|passwd|pwd|secret|token|cookie|authorization|auth|session|jwt|credential|saml|csrf|xsrf|code)/i.test(cleanName)) {
      return "[REDACTED]";
    }
    return redact(value, 240) || "";
  }

  function dataAttributes(element) {
    return Array.from(element.attributes).reduce((all, attribute) => {
      if (attribute.name.toLowerCase().startsWith("data-")) {
        all[attribute.name] = sanitizeAttribute(attribute.name, attribute.value || "");
      }
      return all;
    }, {});
  }

  function labelledByText(element) {
    const value = element.getAttribute("aria-labelledby");
    if (!value) return null;
    return redact(value.split(/\s+/).map(id => {
      const target = document.getElementById(id);
      return target ? target.textContent || "" : "";
    }).join(" "), MAX_TEXT);
  }

  function associatedLabelText(element) {
    if ("labels" in element && element.labels && element.labels.length) {
      return Array.from(element.labels).map(label => label.textContent || "").join(" ");
    }
    const id = element.getAttribute("id");
    if (id) {
      const labels = Array.from(document.querySelectorAll("label")).filter(label => label.htmlFor === id);
      if (labels.length) return labels.map(label => label.textContent || "").join(" ");
    }
    const closest = element.closest("label");
    return closest ? closest.textContent || "" : "";
  }

  function optionText(element) {
    return element.innerText ||
      element.textContent ||
      element.getAttribute("aria-label") ||
      element.getAttribute("title") ||
      associatedLabelText(element) ||
      "";
  }

  function isActionOptionText(value) {
    const key = normalize(value);
    return /^(anwenden|zurucksetzen|zurücksetzen|reset|apply|filter anwenden)$/.test(key);
  }

  function isShowMoreText(value) {
    const key = normalize(value);
    return key === "weitere anzeigen" || /^\d+\s+weitere anzeigen$/.test(key);
  }

  function sanitizedSnippet(element) {
    const clone = element.cloneNode(true);
    for (const current of [clone, ...Array.from(clone.querySelectorAll("*"))]) {
      if (current instanceof HTMLInputElement) current.setAttribute("value", "[REDACTED]");
      for (const attribute of Array.from(current.attributes)) {
        current.setAttribute(attribute.name, sanitizeAttribute(attribute.name, attribute.value || ""));
      }
    }
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      node.nodeValue = redact(node.nodeValue || "", MAX_TEXT) || "";
      node = walker.nextNode();
    }
    return compact(clone.outerHTML).slice(0, MAX_SNIPPET);
  }

  function optionLocator(element, text) {
    const testId = element.getAttribute("data-testid");
    if (testId) return "page.getByTestId(" + JSON.stringify(testId) + ")";
    const role = element.getAttribute("role") || (element.tagName.toLowerCase() === "option" ? "option" : null);
    if (role && text) return "page.getByRole('" + role + "', { name: /" + text.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&") + "/i })";
    if (text) return "page.getByText(" + JSON.stringify(text) + ")";
    return "Use a scoped locator from the configured dropdown trigger";
  }

  const container = document.querySelector(args.containerSelector);
  if (!container) return [];

  const selector = container.tagName.toLowerCase() === "select"
    ? "option"
    : [
        "option",
        "[role='option']",
        "[role='menuitem']",
        "[role='menuitemcheckbox']",
        "[role='menuitemradio']",
        "li",
        "button",
        "[role='button']",
        "input[type='checkbox']",
        "input[type='radio']",
        "[aria-selected]",
        "[aria-checked]",
        "[class*='option' i]",
        "[class*='item' i]"
      ].join(",");

  const seen = new Set();
  const options = [];
  for (const element of Array.from(container.querySelectorAll(selector))) {
    if (!isVisible(element)) continue;
    const rawText = optionText(element);
    if (isActionOptionText(rawText)) continue;
    const text = redact(rawText, MAX_TEXT);
    if (isShowMoreText(text)) continue;
    if (!text && !element.hasAttribute("aria-selected") && !element.hasAttribute("aria-checked")) continue;
    const path = cssPath(element);
    const key = normalize(text) || path;
    if (seen.has(key)) continue;
    seen.add(key);
    const tag = element.tagName.toLowerCase();
    options.push({
      index: options.length,
      text,
      tag,
      type: element.getAttribute("type") ? sanitizeAttribute("type", element.getAttribute("type") || "") : null,
      role: element.getAttribute("role"),
      accessibleName: redact(element.getAttribute("aria-label"), MAX_TEXT) || labelledByText(element) || text,
      id: element.getAttribute("id") ? sanitizeAttribute("id", element.getAttribute("id") || "") : null,
      name: element.getAttribute("name") ? sanitizeAttribute("name", element.getAttribute("name") || "") : null,
      title: element.getAttribute("title") ? redact(element.getAttribute("title"), MAX_TEXT) : null,
      classList: Array.from(element.classList),
      ariaLabel: element.getAttribute("aria-label") ? redact(element.getAttribute("aria-label"), MAX_TEXT) : null,
      ariaLabelledBy: element.getAttribute("aria-labelledby"),
      ariaDescribedBy: element.getAttribute("aria-describedby"),
      ariaSelected: element.getAttribute("aria-selected"),
      ariaChecked: element.getAttribute("aria-checked"),
      dataTestId: element.getAttribute("data-testid") ? sanitizeAttribute("data-testid", element.getAttribute("data-testid") || "") : null,
      dataAttributes: dataAttributes(element),
      disabled: Boolean(element.disabled) || element.getAttribute("aria-disabled") === "true",
      visible: true,
      valuePresent: element.hasAttribute("value"),
      diagnosticDomPath: diagnosticPath(element),
      htmlSnippet: sanitizedSnippet(element),
      locator: optionLocator(element, text)
    });
  }
  return options;
}`;

const PREDEFINED_SHOW_MORE_SCRIPT = String.raw`args => {
  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function normalize(value) {
    return compact(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  function isShowMoreText(value) {
    const key = normalize(value);
    return key === "weitere anzeigen" || /^\d+\s+weitere anzeigen$/.test(key);
  }

  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === "function") return window.CSS.escape(value);
    return String(value).replace(/(["'\\.#:[\]>+~*^$|= ])/g, "\\$1");
  }

  function cssPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      const id = current.getAttribute("id");
      if (id) {
        parts.unshift(tag + "#" + cssEscape(id));
        break;
      }
      let part = tag;
      const parent = current.parentElement;
      if (parent) {
        const sameTag = Array.from(parent.children).filter((sibling) => sibling.tagName === current.tagName);
        if (sameTag.length > 1) part += ":nth-of-type(" + (sameTag.indexOf(current) + 1) + ")";
      }
      parts.unshift(part);
      if (tag === "html") break;
      current = current.parentElement;
    }
    return parts.join(" > ");
  }

  const container = document.querySelector(args.containerSelector);
  if (!container) return null;
  const buttons = Array.from(container.querySelectorAll("button,[role='button']"))
    .filter(isVisible)
    .filter(element => isShowMoreText(element.innerText || element.textContent || element.getAttribute("aria-label") || ""));
  if (buttons.length === 0) return null;
  return cssPath(buttons[0]);
}`;

const PREDEFINED_DROPDOWN_DOM_FALLBACK_SCRIPT = String.raw`args => {
  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function overlapsHorizontally(a, b) {
    return a.left < b.right && a.right > b.left;
  }

  function optionLikeCount(element) {
    const selector = [
      "option",
      "[role='option']",
      "[role='menuitem']",
      "[role='menuitemcheckbox']",
      "[role='menuitemradio']",
      "input[type='checkbox']",
      "input[type='radio']",
      "[role='button']",
      "button",
      "label",
      "li",
      "[aria-selected]",
      "[aria-checked]",
      "[class*='checkbox' i]",
      "[class*='option' i]",
      "[class*='item' i]"
    ].join(",");
    const seen = new Set();
    let count = 0;
    for (const item of Array.from(element.querySelectorAll(selector)).filter(isVisible)) {
      const text = compact(item.innerText || item.textContent || item.getAttribute("aria-label") || item.getAttribute("title") || "");
      if (/^(anwenden|zurucksetzen|zurГјcksetzen|reset|apply|filter anwenden)$/i.test(text)) continue;
      const key = text || item.getAttribute("id") || item.getAttribute("name") || "";
      if (!key || seen.has(key)) continue;
      seen.add(key);
      count += 1;
    }
    return count;
  }

  const trigger = args.triggerSelector ? document.querySelector(args.triggerSelector) : null;
  const triggerRect = trigger ? trigger.getBoundingClientRect() : null;
  const selector = [
    "[role='listbox']",
    "[role='menu']",
    "[role='tree']",
    "[role='grid']",
    "[class*='dropdown' i]",
    "[class*='popover' i]",
    "[class*='popup' i]",
    "[class*='menu' i]",
    "[class*='overlay' i]",
    "[style*='position: absolute' i]",
    "[style*='position:absolute' i]"
  ].join(",");

  const candidates = Array.from(document.querySelectorAll(selector))
    .filter(isVisible)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      const count = optionLikeCount(element);
      const distance = triggerRect
        ? Math.abs(rect.top - triggerRect.bottom) + Math.abs(rect.left - triggerRect.left)
        : 0;
      const nearTrigger = triggerRect
        ? rect.top >= triggerRect.top - 80 && overlapsHorizontally(rect, { left: triggerRect.left - 360, right: triggerRect.right + 720 })
        : true;
      return { element, count, distance, nearTrigger, area: rect.width * rect.height };
    })
    .filter(candidate => candidate.count > 0 && candidate.nearTrigger && candidate.area < window.innerWidth * window.innerHeight * 0.8)
    .sort((a, b) => b.count - a.count || a.distance - b.distance)
    .slice(0, 5);

  if (!candidates.length) return "<!-- no visible dropdown-like DOM was detected after opening this configured filter -->";
  return candidates
    .map((candidate, index) => "<!-- visible dropdown candidate " + (index + 1) + "; option-like descendants: " + candidate.count + " -->\n" + candidate.element.outerHTML)
    .join("\n\n");
}`;

const SANITIZED_DOM_SCRIPT = String.raw`() => {
  const REDACTED = "[REDACTED]";
  const SENSITIVE_NAME = /(password|passwd|pwd|secret|token|cookie|authorization|auth|session|jwt|credential|saml|csrf|xsrf|code)/i;
  const SENSITIVE_QUERY = /(token|auth|session|password|secret|code|ticket|saml|jwt|key)/i;

  function hasSensitiveValue(value) {
    return /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/.test(value) ||
      /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/i.test(value) ||
      /(access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|cookie|session|password|secret|client_secret)=/i.test(value);
  }

  function redactText(value) {
    return String(value || "")
      .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, REDACTED)
      .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 " + REDACTED)
      .replace(/\b(access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|cookie|session|password|secret|client_secret)=([^&\s"'<>]+)/gi, "$1=" + REDACTED)
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED)
      .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, REDACTED)
      .replace(/\b\d{5,}\b/g, REDACTED);
  }

  function sanitizeHash(hash) {
    if (!hash) return "";
    return redactText(hash).replace(/\?[^#]+/g, "?[redacted-query]");
  }

  function sanitizeUrl(value) {
    if (!value) return value;
    try {
      const url = new URL(value, document.baseURI);
      if (url.protocol === "javascript:" || url.protocol === "data:") return "[redacted-url]";
      const safePath = url.pathname.replace(/\/\d{3,}(?=\/|$)/g, "/" + REDACTED);
      const safeSearch = url.search ? "?[redacted-query]" : "";
      return url.origin + safePath + safeSearch + sanitizeHash(url.hash);
    } catch {
      return hasSensitiveValue(value) ? REDACTED : redactText(value);
    }
  }

  function sanitizeElement(root) {
    const elements = [root, ...Array.from(root.querySelectorAll("*"))];
    for (const element of elements) {
      const tag = element.tagName.toLowerCase();
      if (tag === "script") element.textContent = "[REDACTED_SCRIPT_CONTENT]";
      if (element instanceof HTMLInputElement) element.setAttribute("value", REDACTED);
      if (element instanceof HTMLTextAreaElement) element.textContent = REDACTED;

      for (const attribute of Array.from(element.attributes)) {
        const name = attribute.name.toLowerCase();
        const value = attribute.value || "";
        if ((name === "value" && (tag === "input" || tag === "textarea")) || SENSITIVE_NAME.test(name) || hasSensitiveValue(value)) {
          element.setAttribute(attribute.name, REDACTED);
        } else if (["href", "src", "action", "formaction"].includes(name)) {
          element.setAttribute(attribute.name, sanitizeUrl(value));
        } else if (name.startsWith("data-") && (SENSITIVE_NAME.test(value) || hasSensitiveValue(value))) {
          element.setAttribute(attribute.name, REDACTED);
        } else if (SENSITIVE_QUERY.test(name)) {
          element.setAttribute(attribute.name, REDACTED);
        }
      }
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      const parentName = node.parentElement ? node.parentElement.tagName.toLowerCase() : "";
      if (!["style", "title"].includes(parentName)) node.nodeValue = redactText(node.nodeValue || "");
      node = walker.nextNode();
    }
  }

  const clone = document.documentElement.cloneNode(true);
  sanitizeElement(clone);
  return "<!DOCTYPE html>\n" + clone.outerHTML;
}`;

const INTERACTIVE_EXTRACTION_SCRIPT = String.raw`nodes => {
  const REDACTED = "[REDACTED]";
  const MAX_TEXT = 180;
  const MAX_SNIPPET = 900;
  const SENSITIVE_NAME = /(password|passwd|pwd|secret|token|cookie|authorization|auth|session|jwt|credential|saml|csrf|xsrf|code)/i;

  function compact(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function truncate(value, max) {
    const clean = compact(value);
    return clean.length > max ? clean.slice(0, max - 3) + "..." : clean;
  }

  function hasSensitiveValue(value) {
    return /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/.test(value) ||
      /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/i.test(value) ||
      /(access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|cookie|session|password|secret|client_secret)=/i.test(value);
  }

  function redact(value, max) {
    const clean = compact(value);
    if (!clean) return null;
    const redacted = clean
      .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, REDACTED)
      .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 " + REDACTED)
      .replace(/\b(access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|cookie|session|password|secret|client_secret)=([^&\s"'<>]+)/gi, "$1=" + REDACTED)
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, REDACTED)
      .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, REDACTED)
      .replace(/\b\d{5,}\b/g, REDACTED);
    return truncate(redacted, max || MAX_TEXT);
  }

  function sanitizeUrl(value) {
    if (!value) return value;
    try {
      const url = new URL(value, document.baseURI);
      if (url.protocol === "javascript:" || url.protocol === "data:") return "[redacted-url]";
      return url.origin + url.pathname.replace(/\/\d{3,}(?=\/|$)/g, "/" + REDACTED) + (url.search ? "?[redacted-query]" : "") + (url.hash ? "#[redacted-hash]" : "");
    } catch {
      return hasSensitiveValue(value) ? REDACTED : redact(value, MAX_TEXT);
    }
  }

  function sanitizeAttribute(name, value, tag) {
    const cleanName = name.toLowerCase();
    if (cleanName === "value" && (tag === "input" || tag === "textarea")) return REDACTED;
    if (SENSITIVE_NAME.test(cleanName) || hasSensitiveValue(value)) return REDACTED;
    if (["href", "src", "action", "formaction"].includes(cleanName)) return sanitizeUrl(value);
    return truncate(value, 240);
  }

  function sanitizeSnippet(element) {
    const clone = element.cloneNode(true);
    const elements = [clone, ...Array.from(clone.querySelectorAll("*"))];
    for (const current of elements) {
      const tag = current.tagName.toLowerCase();
      if (tag === "script") current.textContent = "[REDACTED_SCRIPT_CONTENT]";
      if (current instanceof HTMLInputElement) current.setAttribute("value", REDACTED);
      if (current instanceof HTMLTextAreaElement) current.textContent = REDACTED;
      for (const attribute of Array.from(current.attributes)) {
        current.setAttribute(attribute.name, sanitizeAttribute(attribute.name, attribute.value || "", tag));
      }
    }
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
      node.nodeValue = redact(node.nodeValue || "", MAX_TEXT) || "";
      node = walker.nextNode();
    }
    return truncate(clone.outerHTML, MAX_SNIPPET);
  }

  function labelText(element) {
    if ("labels" in element && element.labels && element.labels.length) {
      return redact(Array.from(element.labels).map(label => label.textContent || "").join(" "), MAX_TEXT);
    }
    const id = element.getAttribute("id");
    if (id) {
      const labels = Array.from(document.querySelectorAll("label")).filter(label => label.htmlFor === id);
      if (labels.length) return redact(labels.map(label => label.textContent || "").join(" "), MAX_TEXT);
    }
    const closest = element.closest("label");
    return closest ? redact(closest.textContent || "", MAX_TEXT) : null;
  }

  function labelledByText(element) {
    const value = element.getAttribute("aria-labelledby");
    if (!value) return null;
    return redact(value.split(/\s+/).map(id => {
      const target = document.getElementById(id);
      return target ? target.textContent || "" : "";
    }).join(" "), MAX_TEXT);
  }

  function visibleText(element) {
    return redact(element.innerText || element.textContent || "", MAX_TEXT);
  }

  function accessibleName(element) {
    return redact(element.getAttribute("aria-label"), MAX_TEXT) ||
      labelledByText(element) ||
      labelText(element) ||
      redact(element.getAttribute("title"), MAX_TEXT) ||
      redact(element.getAttribute("placeholder"), MAX_TEXT) ||
      visibleText(element);
  }

  function isVisible(element) {
    if (element instanceof HTMLOptionElement) return true;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0" &&
      (element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0);
  }

  function domPath(element) {
    const parts = [];
    let current = element;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      const tag = current.tagName.toLowerCase();
      let part = tag;
      const id = current.getAttribute("id");
      if (id) part += "#" + id;
      const classes = Array.from(current.classList).slice(0, 3);
      if (classes.length) part += "." + classes.join(".");
      const parent = current.parentElement;
      if (parent && !id) {
        const siblings = Array.from(parent.children).filter(sibling => sibling.tagName.toLowerCase() === tag);
        if (siblings.length > 1) part += ":nth-of-type(" + (siblings.indexOf(current) + 1) + ")";
      }
      parts.unshift(part);
      if (tag === "html") break;
      current = parent;
    }
    return parts.join(" > ");
  }

  function dataAttributes(element, tag) {
    return Array.from(element.attributes).reduce((all, attribute) => {
      if (attribute.name.toLowerCase().startsWith("data-")) {
        all[attribute.name] = sanitizeAttribute(attribute.name, attribute.value || "", tag);
      }
      return all;
    }, {});
  }

  const elements = nodes.map((element, index) => {
    const tag = element.tagName.toLowerCase();
    const href = element.getAttribute("href");
    const classList = Array.from(element.classList);
    const disabled = Boolean(element.disabled) || element.getAttribute("aria-disabled") === "true";
    const readOnly = Boolean(element.readOnly) || element.getAttribute("aria-readonly") === "true";
    return {
      index,
      tag,
      type: element.getAttribute("type") ? sanitizeAttribute("type", element.getAttribute("type"), tag) : null,
      visibleText: visibleText(element),
      role: element.getAttribute("role"),
      accessibleName: accessibleName(element),
      id: element.getAttribute("id") ? sanitizeAttribute("id", element.getAttribute("id"), tag) : null,
      name: element.getAttribute("name") ? sanitizeAttribute("name", element.getAttribute("name"), tag) : null,
      placeholder: element.getAttribute("placeholder") ? redact(element.getAttribute("placeholder"), MAX_TEXT) : null,
      title: element.getAttribute("title") ? redact(element.getAttribute("title"), MAX_TEXT) : null,
      classList,
      ariaLabel: element.getAttribute("aria-label") ? redact(element.getAttribute("aria-label"), MAX_TEXT) : null,
      ariaLabelledBy: element.getAttribute("aria-labelledby"),
      ariaDescribedBy: element.getAttribute("aria-describedby"),
      ariaExpanded: element.getAttribute("aria-expanded"),
      ariaSelected: element.getAttribute("aria-selected"),
      ariaChecked: element.getAttribute("aria-checked"),
      ariaControls: element.getAttribute("aria-controls"),
      dataTestId: element.getAttribute("data-testid") ? sanitizeAttribute("data-testid", element.getAttribute("data-testid"), tag) : null,
      dataAttributes: dataAttributes(element, tag),
      disabled,
      appearsDisabled: disabled || classList.some(className => /\bdisabled\b/i.test(className)),
      readOnly,
      hrefPresent: href !== null,
      hrefSanitized: href === null ? null : sanitizeUrl(href),
      associatedLabelText: labelText(element),
      visible: isVisible(element),
      diagnosticDomPath: domPath(element),
      htmlSnippet: sanitizeSnippet(element)
    };
  });

  const shadowRoots = Array.from(document.querySelectorAll("*"))
    .filter(element => element.shadowRoot)
    .map((element, index) => ({
      index,
      hostTag: element.tagName.toLowerCase(),
      hostId: element.getAttribute("id"),
      hostDataTestId: element.getAttribute("data-testid"),
      hostPath: domPath(element),
      mode: "open",
      childElementCount: element.shadowRoot ? element.shadowRoot.querySelectorAll("*").length : 0,
      interactiveElementCount: element.shadowRoot ? element.shadowRoot.querySelectorAll("button,a[href],input,textarea,select,option,[role],[tabindex],summary,[contenteditable='true']").length : 0
    }));

  const iframes = Array.from(document.querySelectorAll("iframe")).map((iframe, index) => {
    try {
      const doc = iframe.contentDocument;
      if (!doc) {
        return { index, sameOrigin: false, srcPresent: Boolean(iframe.getAttribute("src")), diagnosticDomPath: domPath(iframe), note: "not inspectable" };
      }
      return {
        index,
        sameOrigin: true,
        srcPresent: Boolean(iframe.getAttribute("src")),
        diagnosticDomPath: domPath(iframe),
        interactiveElementCount: doc.querySelectorAll("button,a[href],input,textarea,select,option,[role],[tabindex],summary,[contenteditable='true']").length
      };
    } catch {
      return { index, sameOrigin: false, srcPresent: Boolean(iframe.getAttribute("src")), diagnosticDomPath: domPath(iframe), note: "cross-origin or inaccessible" };
    }
  });

  return { elements, shadowRoots, iframes };
}`;

const INTERACTIVE_EXTRACTION_FUNCTION = new Function(
  "nodes",
  `return (${INTERACTIVE_EXTRACTION_SCRIPT})(nodes);`,
) as (nodes: Element[]) => InteractiveExtraction;

type Priority = "High" | "Medium" | "Low";
type LocatorStrategy =
  | "getByRole()"
  | "getByLabel()"
  | "getByText()"
  | "getByPlaceholder()"
  | "getByTestId()"
  | "stable CSS selector";

interface RouteConfig {
  area: string;
  page: string;
  state: string;
  url: string;
}

interface InteractiveElement {
  index: number;
  tag: string;
  type: string | null;
  visibleText: string | null;
  role: string | null;
  accessibleName: string | null;
  id: string | null;
  name: string | null;
  placeholder: string | null;
  title: string | null;
  classList: string[];
  ariaLabel: string | null;
  ariaLabelledBy: string | null;
  ariaDescribedBy: string | null;
  ariaExpanded: string | null;
  ariaSelected: string | null;
  ariaChecked: string | null;
  ariaControls: string | null;
  dataTestId: string | null;
  dataAttributes: Record<string, string>;
  disabled: boolean;
  appearsDisabled: boolean;
  readOnly: boolean;
  hrefPresent: boolean;
  hrefSanitized: string | null;
  associatedLabelText: string | null;
  visible: boolean;
  diagnosticDomPath: string;
  htmlSnippet: string;
}

interface InteractiveExtraction {
  elements: InteractiveElement[];
  shadowRoots: Array<Record<string, unknown>>;
  iframes: Array<Record<string, unknown>>;
}

interface ElementAnalysis {
  category: string;
  issue: string;
  priority: Priority;
  recommendedHtml: string;
  recommendedLocator: string;
  locatorStrategy: LocatorStrategy;
  uniqueIdRequired: boolean;
  ariaLabelRequired: boolean;
  dataTestIdRecommended: boolean;
}

interface CaptureSummary {
  area: string;
  page: string;
  state: string;
  totalInteractiveElements: number;
  elements: InteractiveElement[];
  violations: AxeViolation[];
}

interface DropdownCandidate {
  index: number;
  label: string;
  accessibleName: string;
  selector: string;
  tag: string;
  role: string | null;
  id: string | null;
  dataTestId: string | null;
  title: string | null;
  ariaLabel: string | null;
  ariaHasPopup: string | null;
  ariaControls: string | null;
  ariaExpanded: string | null;
  classList: string[];
  diagnosticDomPath: string;
  kind: DropdownKind;
  inFilterContainer: boolean;
  reason?: string;
}

interface DropdownDetectionResult {
  visibleScanned: DropdownCandidate[];
  candidatesBeforeExclusions: DropdownCandidate[];
  hardExcludedOverlayOpeners: DropdownCandidate[];
  excludedActionControls: DropdownCandidate[];
  candidates: DropdownCandidate[];
  skipped: DropdownCandidate[];
}

interface DropdownOptionInfo {
  index: number;
  text: string;
  tag: string;
  role: string | null;
  id: string | null;
  dataTestId: string | null;
  classList: string[];
  ariaSelected: string | null;
  ariaChecked: string | null;
  valuePresent: boolean;
  locator: string;
}

type DropdownKind = "native select" | "combobox" | "listbox" | "menu" | "uncertain custom dropdown";

interface DropdownRouteStats {
  routeNumber: number;
  route: RouteConfig;
  detectedDropdowns: number;
  openedDropdowns: number;
  nativeSelects: number;
  skippedDropdowns: number;
  hardExcludedOverlayOpeners: number;
  failed?: string;
}

interface DropdownVisibilitySignature {
  optionCount: number;
  popupCount: number;
  signature: string;
}

interface SkippedControl {
  area: string;
  page: string;
  state: string;
  description: string;
  reason: string;
  manualReview: boolean;
}

interface DropdownCaptureRecord {
  route: RouteConfig;
  sequence: number;
  folderName: string;
  candidate: DropdownCandidate;
  options: DropdownOptionInfo[];
  priority: Priority;
  issue: string;
  recommendedHtml: string;
}

type PredefinedFilterType = "dropdown" | "searchable-dropdown";

interface PredefinedFilterConfig {
  label: string;
  type: PredefinedFilterType;
  searchValue?: string;
  optional?: boolean;
}

interface PredefinedFilterRouteConfig {
  area: string;
  page: string;
  url: string;
  filters: PredefinedFilterConfig[];
}

interface PredefinedElementInfo {
  selector: string;
  tag: string;
  type: string | null;
  role: string | null;
  visibleText: string | null;
  accessibleName: string | null;
  id: string | null;
  name: string | null;
  placeholder: string | null;
  title: string | null;
  classList: string[];
  ariaLabel: string | null;
  ariaLabelledBy: string | null;
  ariaDescribedBy: string | null;
  ariaExpanded: string | null;
  ariaControls: string | null;
  dataTestId: string | null;
  dataAttributes: Record<string, string>;
  associatedLabelText: string | null;
  diagnosticDomPath: string;
  htmlSnippet: string;
}

interface PredefinedFilterDetection {
  found: boolean;
  reason: string;
  labelMatchCount: number;
  containerSelector?: string;
  trigger?: PredefinedElementInfo;
  candidates: PredefinedElementInfo[];
}

interface PredefinedActiveContainer {
  found: boolean;
  selector?: string;
  reason: string;
  optionCount: number;
  rawHtml?: string;
}

interface PredefinedOptionInfo {
  index: number;
  text: string | null;
  tag: string;
  type: string | null;
  role: string | null;
  accessibleName: string | null;
  id: string | null;
  name: string | null;
  title: string | null;
  classList: string[];
  ariaLabel: string | null;
  ariaLabelledBy: string | null;
  ariaDescribedBy: string | null;
  ariaSelected: string | null;
  ariaChecked: string | null;
  dataTestId: string | null;
  dataAttributes: Record<string, string>;
  disabled: boolean;
  visible: boolean;
  valuePresent: boolean;
  diagnosticDomPath: string;
  htmlSnippet: string;
  locator: string;
}

interface PredefinedShowMoreResult {
  clickCount: number;
  beforeCount: number;
  afterCount: number;
  additionalOptions: number;
  issue: string | null;
}

interface PredefinedFilterRecord {
  route: PredefinedFilterRouteConfig;
  filter: PredefinedFilterConfig;
  folderName: string;
  triggerFound: boolean;
  openedSuccessfully: boolean;
  optionsDetected: boolean;
  optionCountBeforeShowMore: number;
  optionCountAfterShowMore: number;
  showMoreClicks: number;
  additionalOptionsRevealed: number;
  activeContainerFound: boolean;
  trigger: PredefinedElementInfo | null;
  options: PredefinedOptionInfo[];
  priority: Priority;
  issues: string[];
  locatorRisks: string[];
}

interface PredefinedPageStats {
  pageNumber: number;
  route: PredefinedFilterRouteConfig;
  configuredFilterCount: number;
  foundFilterCount: number;
  openedDropdownCount: number;
  searchableDropdownCount: number;
  inspectedOptionCount: number;
  skippedFilterCount: number;
  filtersWithShowMore: number;
  additionalOptionsRevealed: number;
}

interface MissingOrSkippedFilter {
  area: string;
  page: string;
  label: string;
  reason: string;
  optional: boolean;
}

interface AxeViolation {
  id: string;
  impact?: string;
  description?: string;
  help?: string;
  nodes?: unknown[];
}

interface AxeResult {
  violations?: AxeViolation[];
  error?: string;
  [key: string]: unknown;
}

async function main(): Promise<void> {
  const dropdownOnly = process.argv.includes("--dropdown-only");
  const predefinedFilterAudit = process.argv.includes("--predefined-filter-audit");
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  await fs.mkdir(PROFILE_DIR, { recursive: true });
  await fs.mkdir(PAGES_ROOT, { recursive: true });

  const context = await chromium.launchPersistentContext(PROFILE_DIR, {
    headless: false,
  });
  const page = context.pages()[0] ?? (await context.newPage());

  try {
    if (predefinedFilterAudit) {
      const predefinedRoutes = await loadPredefinedFilterRoutes();
      await page.goto(predefinedRoutes[0].url, { waitUntil: "domcontentloaded" });
      await rl.question(
        "Complete the login manually if required. Press Enter after the authenticated D2D INT application is visible.",
      );
      await runPredefinedFilterAudit(page, predefinedRoutes, rl);
      return;
    }

    const routes = await loadRoutes();
    if (dropdownOnly) {
      await page.goto(routes[0].url, { waitUntil: "domcontentloaded" });
      await rl.question(
        "Complete the login manually if required. Press Enter after the authenticated D2D INT application is visible.",
      );
      await runDropdownOnlyAudit(page, routes, rl);
      return;
    }

    await page.goto(routes[0].url, { waitUntil: "domcontentloaded" });
    await rl.question(
      "Complete the login manually in the browser. Press Enter here after the authenticated D2D application is visible.",
    );

    await navigateToRoute(page, routes[0]);
    await page.reload({ waitUntil: "domcontentloaded" });
    await settlePage(page);
    await captureRoute(page, routes[0]);

    for (const route of routes.slice(1)) {
      await navigateToRoute(page, route);
      await captureRoute(page, route);
    }

    console.log("");
    console.log("Default route audit completed.");
    console.log("For hidden UI states, open the required dropdown, panel, modal, or tab manually in the browser.");
    console.log("Then type:");
    console.log("capture-current <area> <page> <state>");
    console.log("Type finish when you are done.");
    console.log("");
    printHelp();

    for (;;) {
      const command = (await rl.question("ui-audit> ")).trim();
      if (!command) continue;

      const [name, ...args] = command.split(/\s+/);
      if (name === "help") {
        printHelp();
        continue;
      }

      if (name === "finish") {
        await createFinalSummary();
        console.log("Summary written.");
        break;
      }

      if (name === "capture-current") {
        if (args.length !== 3) {
          console.log("Usage: capture-current <area> <page> <state>");
          continue;
        }

        const [area, pageName, state] = args;
        if (![area, pageName, state].every(isSafeSlug)) {
          console.log("Use slugs with letters, numbers, dots, underscores, and hyphens only.");
          continue;
        }

        await captureRoute(page, { area, page: pageName, state, url: page.url() }, true);
        continue;
      }

      console.log(`Unknown command: ${name}`);
      printHelp();
    }
  } finally {
    rl.close();
    await context.close();
  }
}

async function loadRoutes(): Promise<RouteConfig[]> {
  const parsed = JSON.parse(await fs.readFile(ROUTES_FILE, "utf8")) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("scripts/ui-audit.routes.local.json must contain a JSON array.");
  }

  const routes = parsed.map((value, index) => {
    if (!isRecord(value)) {
      throw new Error(`Route ${index + 1} must be an object.`);
    }

    const route = {
      area: stringField(value, "area"),
      page: stringField(value, "page"),
      state: stringField(value, "state"),
      url: stringField(value, "url"),
    };

    if (![route.area, route.page, route.state].every(isSafeSlug)) {
      throw new Error(`Route ${index + 1} has an unsafe area, page, or state slug.`);
    }

    try {
      new URL(route.url);
    } catch {
      throw new Error(`Route ${index + 1} has an invalid URL.`);
    }

    return route;
  });

  if (routes.length === 0) {
    throw new Error("At least one route is required in scripts/ui-audit.routes.local.json.");
  }

  return routes;
}

async function loadPredefinedFilterRoutes(): Promise<PredefinedFilterRouteConfig[]> {
  const parsed = JSON.parse(await fs.readFile(PREDEFINED_FILTERS_FILE, "utf8")) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("scripts/ui-audit.predefined-filters.local.json must contain a JSON array.");
  }

  const routes = parsed.map((value, index) => {
    if (!isRecord(value)) {
      throw new Error(`Predefined route ${index + 1} must be an object.`);
    }

    const filtersValue = value.filters;
    if (!Array.isArray(filtersValue) || filtersValue.length === 0) {
      throw new Error(`Predefined route ${index + 1} must contain at least one filter.`);
    }

    const route = {
      area: stringField(value, "area"),
      page: stringField(value, "page"),
      url: stringField(value, "url"),
      filters: filtersValue.map((filterValue, filterIndex) => {
        if (!isRecord(filterValue)) {
          throw new Error(`Filter ${filterIndex + 1} in predefined route ${index + 1} must be an object.`);
        }

        const type = stringField(filterValue, "type");
        if (type !== "dropdown" && type !== "searchable-dropdown") {
          throw new Error(`Filter ${filterIndex + 1} in predefined route ${index + 1} has an unsupported type.`);
        }

        const filter: PredefinedFilterConfig = {
          label: stringField(filterValue, "label"),
          type,
          optional: filterValue.optional === true,
        };
        const searchValue = nullableString(filterValue.searchValue);
        if (searchValue) filter.searchValue = searchValue;
        if (filter.type === "searchable-dropdown" && !filter.searchValue) {
          throw new Error(`Searchable filter ${filterIndex + 1} in predefined route ${index + 1} requires searchValue.`);
        }
        return filter;
      }),
    };

    if (![route.area, route.page].every(isSafeSlug)) {
      throw new Error(`Predefined route ${index + 1} has an unsafe area or page slug.`);
    }

    try {
      new URL(route.url);
    } catch {
      throw new Error(`Predefined route ${index + 1} has an invalid URL.`);
    }

    return route;
  });

  if (routes.length === 0) {
    throw new Error("At least one route is required in scripts/ui-audit.predefined-filters.local.json.");
  }

  return routes;
}

async function navigateToRoute(page: Page, route: RouteConfig): Promise<void> {
  console.log(`${route.area} / ${route.page} / ${route.state}`);
  await page.goto(route.url, { waitUntil: "domcontentloaded" });
  await settlePage(page);
}

async function settlePage(page: Page): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS });
  } catch {
    // SPAs can keep long-lived requests open; capture after the fixed settle delay below.
  }

  await page.waitForTimeout(SETTLE_DELAY_MS);
}

async function captureRoute(page: Page, route: RouteConfig, manual = false): Promise<void> {
  const outputDir = path.join(PAGES_ROOT, route.area, route.page, route.state);
  await captureStateToDirectory(page, route, outputDir, manual);
}

async function captureStateToDirectory(
  page: Page,
  route: RouteConfig,
  outputDir: string,
  manual = false,
): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });

  const rawDom = await page.content();
  const sanitizedDom = await page.evaluate<string>(`(${SANITIZED_DOM_SCRIPT})()`);
  const interactive = normalizeInteractiveExtraction(
    await page.locator(INTERACTIVE_SELECTOR).evaluateAll<InteractiveExtraction>(INTERACTIVE_EXTRACTION_FUNCTION),
  );
  const accessibility = await runAccessibilityScan(page);

  await fs.writeFile(path.join(outputDir, "raw-dom.html"), rawDom, "utf8");
  await fs.writeFile(path.join(outputDir, "sanitized-dom.html"), sanitizedDom, "utf8");
  await fs.writeFile(path.join(outputDir, "interactive-elements.json"), `${JSON.stringify(interactive, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(outputDir, "accessibility-report.json"),
    `${JSON.stringify(accessibility, null, 2)}\n`,
    "utf8",
  );

  if (CAPTURE_SCREENSHOTS) {
    await page.screenshot({ path: path.join(outputDir, "full-page.png"), fullPage: true });
  }

  const report = buildRouteReport(route, interactive, accessibility, manual);
  await fs.writeFile(path.join(outputDir, "IMPROVEMENTS.md"), report, "utf8");
}

async function runDropdownOnlyAudit(
  page: Page,
  routes: RouteConfig[],
  rl: ReturnType<typeof createInterface>,
): Promise<void> {
  const runRoot = await createDropdownRunRoot();
  const stats: DropdownRouteStats[] = [];
  const skipped: SkippedControl[] = [];
  const captures: DropdownCaptureRecord[] = [];

  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    const routeStats: DropdownRouteStats = {
      routeNumber: index + 1,
      route,
      detectedDropdowns: 0,
      openedDropdowns: 0,
      nativeSelects: 0,
      skippedDropdowns: 0,
      hardExcludedOverlayOpeners: 0,
    };

    try {
      await navigateForDropdownAudit(page, route, rl);
      const routeCaptures = await auditDropdownRoute(page, route, runRoot, skipped, routeStats);
      captures.push(...routeCaptures);
    } catch (error) {
      const message = sanitizeError(error);
      routeStats.failed = message;
      routeStats.skippedDropdowns += 1;
      await writeDropdownFailureDiagnostics(runRoot, route, message);
      skipped.push({
        area: route.area,
        page: route.page,
        state: route.state,
        description: "Route dropdown audit failed.",
        reason: message,
        manualReview: true,
      });
    }

    stats.push(routeStats);
    console.log(
      `${routeStats.routeNumber}/${routes.length} ${route.area} / ${route.page} / ${route.state} detected=${routeStats.detectedDropdowns} opened=${routeStats.openedDropdowns} skipped=${routeStats.skippedDropdowns}`,
    );
  }

  await writeSkippedControls(runRoot, skipped);
  await writeDropdownSummary(runRoot, stats, skipped, captures);
  console.log(`Dropdown-only audit complete: ${path.relative(process.cwd(), runRoot)}`);
}

async function runPredefinedFilterAudit(
  page: Page,
  routes: PredefinedFilterRouteConfig[],
  rl: ReturnType<typeof createInterface>,
): Promise<void> {
  const runRoot = await createPredefinedFilterRunRoot();
  const stats: PredefinedPageStats[] = [];
  const missingOrSkipped: MissingOrSkippedFilter[] = [];
  const records: PredefinedFilterRecord[] = [];

  for (let routeIndex = 0; routeIndex < routes.length; routeIndex += 1) {
    const route = routes[routeIndex];
    const pageStats: PredefinedPageStats = {
      pageNumber: routeIndex + 1,
      route,
      configuredFilterCount: route.filters.length,
      foundFilterCount: 0,
      openedDropdownCount: 0,
      searchableDropdownCount: 0,
      inspectedOptionCount: 0,
      skippedFilterCount: 0,
      filtersWithShowMore: 0,
      additionalOptionsRevealed: 0,
    };

    for (let filterIndex = 0; filterIndex < route.filters.length; filterIndex += 1) {
      const filter = route.filters[filterIndex];
      const record = await inspectPredefinedFilter(page, route, filter, filterIndex + 1, runRoot, rl, missingOrSkipped);
      records.push(record);

      if (record.triggerFound) pageStats.foundFilterCount += 1;
      if (record.openedSuccessfully && filter.type === "dropdown") pageStats.openedDropdownCount += 1;
      if (record.openedSuccessfully && filter.type === "searchable-dropdown") pageStats.searchableDropdownCount += 1;
      if (!record.openedSuccessfully || !record.triggerFound) pageStats.skippedFilterCount += 1;
      pageStats.inspectedOptionCount += record.options.length;
      if (record.showMoreClicks > 0) pageStats.filtersWithShowMore += 1;
      pageStats.additionalOptionsRevealed += record.additionalOptionsRevealed;
    }

    stats.push(pageStats);
    console.log(
      `${pageStats.pageNumber}/${routes.length} ${route.area} / ${route.page} filters=${pageStats.configuredFilterCount} found=${pageStats.foundFilterCount} opened=${pageStats.openedDropdownCount + pageStats.searchableDropdownCount} options=${pageStats.inspectedOptionCount} skipped=${pageStats.skippedFilterCount}`,
    );
  }

  await writePredefinedMissingOrSkipped(runRoot, missingOrSkipped);
  await writePredefinedSummary(runRoot, stats, records, missingOrSkipped);
  console.log(`Predefined-filter audit complete: ${path.relative(process.cwd(), runRoot)}`);
}

async function inspectPredefinedFilter(
  page: Page,
  route: PredefinedFilterRouteConfig,
  filter: PredefinedFilterConfig,
  sequence: number,
  runRoot: string,
  rl: ReturnType<typeof createInterface>,
  missingOrSkipped: MissingOrSkippedFilter[],
): Promise<PredefinedFilterRecord> {
  const folderName = `${String(sequence).padStart(2, "0")}-${slugify(filter.label)}`;
  const outputDir = path.join(runRoot, "pages", route.area, route.page, "filters", folderName);
  await fs.mkdir(outputDir, { recursive: true });

  await resetPredefinedFilterPage(page, route, rl);
  const detection = await findPredefinedFilter(page, filter);
  let activeContainer: PredefinedActiveContainer = {
    found: false,
    reason: "No dropdown action was attempted.",
    optionCount: 0,
  };
  let showMore: PredefinedShowMoreResult = {
    clickCount: 0,
    beforeCount: 0,
    afterCount: 0,
    additionalOptions: 0,
    issue: null,
  };
  let options: PredefinedOptionInfo[] = [];
  let rawDropdownHtml = "<!-- configured filter was not captured -->";
  let openedSuccessfully = false;
  let closeDropdownAfterWrite = false;

  if (!detection.found || !detection.trigger) {
    missingOrSkipped.push({
      area: route.area,
      page: route.page,
      label: filter.label,
      reason: detection.reason,
      optional: filter.optional === true,
    });
  } else if (filter.type === "searchable-dropdown") {
    const beforeSignatures = await getPredefinedVisibleContainerSignatures(page);
    try {
      await page.locator(detection.trigger.selector).first().scrollIntoViewIfNeeded({ timeout: 3000 });
      await page.locator(detection.trigger.selector).first().click({ timeout: 5000 });
      closeDropdownAfterWrite = true;
      await page.waitForTimeout(500);
      activeContainer = await waitForPredefinedActiveContainer(page, beforeSignatures, detection.trigger.selector, true);
      if (activeContainer.found && activeContainer.selector) {
        const input = page
          .locator(activeContainer.selector)
          .locator("input:not([type='checkbox']):not([type='radio']), textarea, [role='combobox']")
          .first();
        await input.fill(filter.searchValue ?? "", { timeout: 5000 });
        await page.waitForTimeout(700);
        await waitForPredefinedOptions(page, activeContainer.selector, 1, 8000);
        const beforeShowMoreOptions = await extractPredefinedOptions(page, activeContainer.selector);
        showMore = await revealPredefinedShowMoreOptions(page, activeContainer.selector, beforeShowMoreOptions.length);
        options = await extractPredefinedOptions(page, activeContainer.selector);
        rawDropdownHtml = await getElementOuterHtml(page, activeContainer.selector);
        openedSuccessfully = options.length > 0;
      } else {
        rawDropdownHtml = await getPredefinedDropdownDomFallback(page, detection.trigger.selector);
      }
    } catch (error) {
      rawDropdownHtml = await getPredefinedDropdownDomFallback(page, detection.trigger.selector);
      activeContainer = {
        found: false,
        reason: `Searchable dropdown could not be inspected safely: ${sanitizeError(error)}`,
        optionCount: 0,
      };
    }
  } else if (detection.trigger.tag === "select") {
    activeContainer = {
      found: true,
      selector: detection.trigger.selector,
      reason: "Native select inspected without selecting an option.",
      optionCount: 0,
      rawHtml: await getElementOuterHtml(page, detection.trigger.selector),
    };
    options = await extractPredefinedOptions(page, detection.trigger.selector);
    showMore.beforeCount = options.length;
    showMore.afterCount = options.length;
    rawDropdownHtml = activeContainer.rawHtml ?? rawDropdownHtml;
    openedSuccessfully = true;
  } else {
    const beforeSignatures = await getPredefinedVisibleContainerSignatures(page);
    try {
      await page.locator(detection.trigger.selector).first().scrollIntoViewIfNeeded({ timeout: 3000 });
      await page.locator(detection.trigger.selector).first().click({ timeout: 5000 });
      closeDropdownAfterWrite = true;
      await page.waitForTimeout(500);
      activeContainer = await waitForPredefinedActiveContainer(page, beforeSignatures, detection.trigger.selector, false);
      if (activeContainer.found && activeContainer.selector) {
        const beforeShowMoreOptions = await extractPredefinedOptions(page, activeContainer.selector);
        showMore = await revealPredefinedShowMoreOptions(page, activeContainer.selector, beforeShowMoreOptions.length);
        options = await extractPredefinedOptions(page, activeContainer.selector);
        rawDropdownHtml = await getElementOuterHtml(page, activeContainer.selector);
        openedSuccessfully = options.length > 0;
      } else {
        rawDropdownHtml = await getPredefinedDropdownDomFallback(page, detection.trigger.selector);
      }
    } catch (error) {
      rawDropdownHtml = await getPredefinedDropdownDomFallback(page, detection.trigger.selector);
      activeContainer = {
        found: false,
        reason: `Dropdown trigger could not be opened safely: ${sanitizeError(error)}`,
        optionCount: 0,
      };
    }
  }

  if (detection.found && !openedSuccessfully) {
    missingOrSkipped.push({
      area: route.area,
      page: route.page,
      label: filter.label,
      reason: activeContainer.reason,
      optional: filter.optional === true,
    });
  }

  const trigger = detection.trigger ?? null;
  const record = buildPredefinedFilterRecord(
    route,
    filter,
    folderName,
    trigger,
    openedSuccessfully,
    activeContainer.found,
    options,
    showMore,
  );
  try {
    await writePredefinedFilterFiles(page, outputDir, route, filter, detection, activeContainer, record, rawDropdownHtml);
  } finally {
    if (closeDropdownAfterWrite) {
      await pressEscapeSafely(page);
      await page.waitForTimeout(300);
    }
  }
  return record;
}

async function resetPredefinedFilterPage(
  page: Page,
  route: PredefinedFilterRouteConfig,
  rl: ReturnType<typeof createInterface>,
): Promise<void> {
  await page.goto(route.url, { waitUntil: "domcontentloaded" });
  await settlePredefinedFilterPage(page);

  if (await isAuthenticationLikelyExpired(page)) {
    console.log("Authentication may have expired. Complete the login manually and press Enter to continue.");
    await rl.question("");
    await page.goto(route.url, { waitUntil: "domcontentloaded" });
    await settlePredefinedFilterPage(page);
  }

  await pressEscapeSafely(page);
  await page.waitForTimeout(300);

  if (await isBlockingFilterOverlayVisible(page)) {
    await pressEscapeSafely(page);
    await page.waitForTimeout(400);
  }

  if (await isBlockingFilterOverlayVisible(page)) {
    await page.reload({ waitUntil: "domcontentloaded" });
    await settlePredefinedFilterPage(page);
    await pressEscapeSafely(page);
    await page.waitForTimeout(300);
  }
}

async function settlePredefinedFilterPage(page: Page): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout: NETWORK_IDLE_TIMEOUT_MS });
  } catch {
    // Some INT pages keep background requests alive; continue after the fixed delay.
  }
  await page.waitForTimeout(1000);
}

async function findPredefinedFilter(
  page: Page,
  filter: PredefinedFilterConfig,
): Promise<PredefinedFilterDetection> {
  return evaluateBrowserScript<PredefinedFilterDetection>(page, PREDEFINED_FIND_FILTER_SCRIPT, filter);
}

async function getPredefinedVisibleContainerSignatures(page: Page): Promise<string[]> {
  return evaluateBrowserScript<string[]>(page, PREDEFINED_VISIBLE_CONTAINERS_SCRIPT);
}

async function findPredefinedActiveContainer(
  page: Page,
  beforeSignatures: string[],
  triggerSelector: string,
  allowInputOnly = false,
): Promise<PredefinedActiveContainer> {
  return evaluateBrowserScript<PredefinedActiveContainer>(page, PREDEFINED_ACTIVE_CONTAINER_SCRIPT, {
    beforeSignatures,
    triggerSelector,
    allowInputOnly,
  });
}

async function waitForPredefinedActiveContainer(
  page: Page,
  beforeSignatures: string[],
  triggerSelector: string,
  allowInputOnly: boolean,
): Promise<PredefinedActiveContainer> {
  const deadline = Date.now() + 8000;
  let latest: PredefinedActiveContainer = {
    found: false,
    reason: "Active dropdown option container was not checked yet.",
    optionCount: 0,
  };

  while (Date.now() < deadline) {
    latest = await findPredefinedActiveContainer(page, beforeSignatures, triggerSelector, allowInputOnly);
    if (latest.found) return latest;
    await page.waitForTimeout(250);
  }

  return latest;
}

async function extractPredefinedOptions(page: Page, containerSelector: string): Promise<PredefinedOptionInfo[]> {
  return evaluateBrowserScript<PredefinedOptionInfo[]>(page, PREDEFINED_EXTRACT_OPTIONS_SCRIPT, { containerSelector });
}

async function getPredefinedDropdownDomFallback(page: Page, triggerSelector: string): Promise<string> {
  try {
    return await evaluateBrowserScript<string>(page, PREDEFINED_DROPDOWN_DOM_FALLBACK_SCRIPT, { triggerSelector });
  } catch (error) {
    return `<!-- visible dropdown DOM fallback failed: ${sanitizeError(error)} -->`;
  }
}

async function waitForPredefinedOptions(
  page: Page,
  containerSelector: string,
  minimumCount: number,
  timeoutMs: number,
): Promise<PredefinedOptionInfo[]> {
  const deadline = Date.now() + timeoutMs;
  let latest: PredefinedOptionInfo[] = [];

  while (Date.now() < deadline) {
    latest = await extractPredefinedOptions(page, containerSelector);
    if (latest.length >= minimumCount) return latest;
    await page.waitForTimeout(300);
  }

  return latest;
}

async function revealPredefinedShowMoreOptions(
  page: Page,
  containerSelector: string,
  initialCount: number,
): Promise<PredefinedShowMoreResult> {
  let beforeCount = initialCount;
  let afterCount = initialCount;
  let clickCount = 0;
  let issue: string | null = null;

  for (; clickCount < MAX_SHOW_MORE_CLICKS; clickCount += 1) {
    const showMoreSelector = await evaluateBrowserScript<string | null>(page, PREDEFINED_SHOW_MORE_SCRIPT, {
      containerSelector,
    });
    if (!showMoreSelector) break;

    const showMore = page.locator(showMoreSelector).first();
    await showMore.scrollIntoViewIfNeeded({ timeout: 2000 });
    await page.waitForTimeout(250);
    await showMore.click({ timeout: 4000 });
    await page.waitForTimeout(1000);
    const options = await waitForPredefinedOptions(page, containerSelector, beforeCount + 1, 5000);
    afterCount = options.length;
    if (afterCount <= beforeCount) {
      issue = "\"weitere anzeigen\" did not increase the visible option count; stopped clicking it.";
      clickCount += 1;
      break;
    }
    beforeCount = afterCount;
  }

  if (clickCount === MAX_SHOW_MORE_CLICKS) {
    issue = `Reached MAX_SHOW_MORE_CLICKS=${MAX_SHOW_MORE_CLICKS}.`;
  }

  return {
    clickCount,
    beforeCount: initialCount,
    afterCount,
    additionalOptions: Math.max(0, afterCount - initialCount),
    issue,
  };
}

async function navigateForDropdownAudit(
  page: Page,
  route: RouteConfig,
  rl: ReturnType<typeof createInterface>,
): Promise<void> {
  await page.goto(route.url, { waitUntil: "domcontentloaded" });
  await settlePage(page);

  if (await isAuthenticationLikelyExpired(page)) {
    console.log("Authentication may have expired. Complete the login manually and press Enter to continue.");
    await rl.question("");
    await page.goto(route.url, { waitUntil: "domcontentloaded" });
    await settlePage(page);
  }

  await resetDropdownRoutePage(page, route);
}

async function resetDropdownRoutePage(page: Page, route: RouteConfig): Promise<void> {
  await pressEscapeSafely(page);
  await page.waitForTimeout(300);

  if (await isBlockingFilterOverlayVisible(page)) {
    await pressEscapeSafely(page);
    await page.waitForTimeout(400);
  }

  if (await isBlockingFilterOverlayVisible(page)) {
    await page.goto(route.url, { waitUntil: "domcontentloaded" });
    await settlePage(page);
    await pressEscapeSafely(page);
    await page.waitForTimeout(300);
  }
}

async function pressEscapeSafely(page: Page): Promise<void> {
  try {
    await page.keyboard.press("Escape");
  } catch {
    // The browser may be between navigations; the next route action will recover.
  }
}

async function isBlockingFilterOverlayVisible(page: Page): Promise<boolean> {
  try {
    return await page.evaluate<boolean>(`(${BLOCKING_FILTER_OVERLAY_VISIBLE_SCRIPT})()`);
  } catch {
    return false;
  }
}

async function auditDropdownRoute(
  page: Page,
  route: RouteConfig,
  runRoot: string,
  skipped: SkippedControl[],
  stats: DropdownRouteStats,
): Promise<DropdownCaptureRecord[]> {
  const captures: DropdownCaptureRecord[] = [];
  const openedCandidates: DropdownCandidate[] = [];

  const detection = await detectDropdownCandidates(page);
  const routeSkippedCandidates: DropdownCandidate[] = [...detection.skipped];

  for (const skippedCandidate of detection.skipped) {
    const reason = skippedCandidate.reason ?? "Skipped by conservative dropdown safety rules.";
    skipped.push({
      area: route.area,
      page: route.page,
      state: route.state,
      description: describeDropdownCandidate(skippedCandidate),
      reason,
      manualReview: reason !== "Skipped intentionally: blocking full-filters overlay opener",
    });
  }

  stats.detectedDropdowns = detection.candidates.length;
  stats.skippedDropdowns += detection.skipped.length;
  stats.hardExcludedOverlayOpeners = detection.hardExcludedOverlayOpeners.length;

  if (detection.candidates.length > MAX_DROPDOWNS_PER_ROUTE) {
    stats.skippedDropdowns += detection.candidates.length;
    routeSkippedCandidates.push(
      ...detection.candidates.map((candidate) => ({
        ...candidate,
        reason: `Exceeded safety maximum MAX_DROPDOWNS_PER_ROUTE=${MAX_DROPDOWNS_PER_ROUTE}; no candidates clicked on this route.`,
      })),
    );
    skipped.push({
      area: route.area,
      page: route.page,
      state: route.state,
      description: `${detection.candidates.length} dropdown candidates detected.`,
      reason: `Exceeded safety maximum MAX_DROPDOWNS_PER_ROUTE=${MAX_DROPDOWNS_PER_ROUTE}; no candidates clicked on this route.`,
      manualReview: true,
    });
    await writeDropdownDiagnostics(runRoot, route, detection, [], routeSkippedCandidates);
    return captures;
  }

  let sequence = 1;
  for (const candidate of detection.candidates) {
    if (candidate.kind === "native select") {
      const options = await getNativeSelectOptions(page, candidate);
      const folder = await captureDropdownState(page, route, runRoot, candidate, options, sequence, true);
      const record = buildDropdownRecord(route, candidate, options, sequence, folder);
      captures.push(record);
      openedCandidates.push(candidate);
      await writeFilterDropdownMarkdown(folder, record);
      stats.nativeSelects += 1;
      sequence += 1;
      continue;
    }

    const beforeOptions = await getVisibleDropdownOptions(page);
    const beforeSignature = await getDropdownVisibilitySignature(page);
    const opened = await openCustomDropdown(page, candidate);
    if (!opened) {
      const reason = "Candidate could not be opened safely.";
      stats.skippedDropdowns += 1;
      routeSkippedCandidates.push({ ...candidate, reason });
      skipped.push({
        area: route.area,
        page: route.page,
        state: route.state,
        description: describeDropdownCandidate(candidate),
        reason,
        manualReview: true,
      });
      continue;
    }

    await page.waitForTimeout(700);
    const afterOptions = await getVisibleDropdownOptions(page);
    const afterSignature = await getDropdownVisibilitySignature(page);
    const dropdownAppeared =
      afterOptions.length > beforeOptions.length &&
      afterSignature.signature !== beforeSignature.signature &&
      afterSignature.optionCount > beforeSignature.optionCount;
    if (!dropdownAppeared) {
      await page.keyboard.press("Escape");
      const reason = "No newly visible selectable dropdown content appeared after opening.";
      stats.skippedDropdowns += 1;
      routeSkippedCandidates.push({ ...candidate, reason });
      skipped.push({
        area: route.area,
        page: route.page,
        state: route.state,
        description: describeDropdownCandidate(candidate),
        reason,
        manualReview: true,
      });
      continue;
    }

    const folder = await captureDropdownState(page, route, runRoot, candidate, afterOptions, sequence, false);
    const record = buildDropdownRecord(route, candidate, afterOptions, sequence, folder);
    captures.push(record);
    openedCandidates.push(candidate);
    await writeFilterDropdownMarkdown(folder, record);
    stats.openedDropdowns += 1;
    sequence += 1;

    const closed = await closeDropdownSafely(page, candidate, afterOptions.length);
    if (!closed) {
      stats.skippedDropdowns += detection.candidates.length - sequence + 1;
      routeSkippedCandidates.push({
        ...candidate,
        reason: "Escape did not close the dropdown safely; stopped processing additional dropdowns on this route.",
      });
      skipped.push({
        area: route.area,
        page: route.page,
        state: route.state,
        description: describeDropdownCandidate(candidate),
        reason: "Escape did not close the dropdown safely; stopped processing additional dropdowns on this route.",
        manualReview: true,
      });
      break;
    }
  }

  await writeDropdownDiagnostics(runRoot, route, detection, openedCandidates, routeSkippedCandidates);
  return captures;
}

async function detectDropdownCandidates(page: Page): Promise<DropdownDetectionResult> {
  const result = await page.evaluate<DropdownDetectionResult>(`(${DROPDOWN_CANDIDATE_DETECTION_SCRIPT})()`);
  return {
    visibleScanned: result?.visibleScanned ?? [],
    candidatesBeforeExclusions: result?.candidatesBeforeExclusions ?? [],
    hardExcludedOverlayOpeners: result?.hardExcludedOverlayOpeners ?? [],
    excludedActionControls: result?.excludedActionControls ?? [],
    candidates: (result?.candidates ?? []).slice(0, MAX_DROPDOWNS_PER_ROUTE + 1),
    skipped: result?.skipped ?? [],
  };
}

async function getVisibleDropdownOptions(page: Page): Promise<DropdownOptionInfo[]> {
  return (await page.evaluate<DropdownOptionInfo[]>(`(${VISIBLE_DROPDOWN_OPTIONS_SCRIPT})()`)) ?? [];
}

async function getDropdownVisibilitySignature(page: Page): Promise<DropdownVisibilitySignature> {
  return (
    (await page.evaluate<DropdownVisibilitySignature>(`(${VISIBLE_DROPDOWN_SIGNATURE_SCRIPT})()`)) ?? {
      optionCount: 0,
      popupCount: 0,
      signature: "",
    }
  );
}

async function getNativeSelectOptions(page: Page, candidate: DropdownCandidate): Promise<DropdownOptionInfo[]> {
  try {
    return await page.locator(candidate.selector).first().evaluate((select) => {
      const element = select as HTMLSelectElement;
      return Array.from(element.options).map((option, index) => ({
        index,
        text: (option.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 180),
        tag: "option",
        role: option.getAttribute("role"),
        id: option.getAttribute("id"),
        dataTestId: option.getAttribute("data-testid"),
        classList: Array.from(option.classList),
        ariaSelected: option.getAttribute("aria-selected"),
        ariaChecked: option.getAttribute("aria-checked"),
        valuePresent: option.hasAttribute("value"),
        locator: `page.getByRole('option', { name: /${(option.textContent ?? "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/i })`,
      }));
    });
  } catch {
    return [];
  }
}

async function openCustomDropdown(page: Page, candidate: DropdownCandidate): Promise<boolean> {
  try {
    const locator = page.locator(candidate.selector).first();
    await locator.scrollIntoViewIfNeeded({ timeout: 3000 });
    await locator.click({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

async function closeDropdownSafely(page: Page, candidate: DropdownCandidate, openOptionCount: number): Promise<boolean> {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const afterEscape = await getVisibleDropdownOptions(page);
  if (afterEscape.length < openOptionCount || afterEscape.length === 0) {
    return true;
  }

  if (candidate.ariaExpanded === "false" || candidate.ariaExpanded === "true") {
    try {
      await page.locator(candidate.selector).first().click({ timeout: 3000 });
      await page.waitForTimeout(400);
      const afterToggle = await getVisibleDropdownOptions(page);
      return afterToggle.length < openOptionCount || afterToggle.length === 0;
    } catch {
      return false;
    }
  }

  return false;
}

async function captureDropdownState(
  page: Page,
  route: RouteConfig,
  runRoot: string,
  candidate: DropdownCandidate,
  options: DropdownOptionInfo[],
  sequence: number,
  nativeSelect: boolean,
): Promise<string> {
  const folderName = `${String(sequence).padStart(2, "0")}-${slugify(firstPresent(candidate.label, candidate.accessibleName, candidate.id, candidate.dataTestId) ?? "dropdown")}`;
  const outputDir = path.join(
    runRoot,
    "pages",
    route.area,
    route.page,
    route.state,
    "filter-dropdowns",
    folderName,
  );
  const captureRouteConfig = {
    ...route,
    state: `${route.state} / ${nativeSelect ? "native select" : "dropdown"} ${sequence}`,
  };
  await captureStateToDirectory(page, captureRouteConfig, outputDir, true);
  await fs.writeFile(path.join(outputDir, "dropdown-options.json"), `${JSON.stringify(options, null, 2)}\n`, "utf8");
  return outputDir;
}

function buildDropdownRecord(
  route: RouteConfig,
  candidate: DropdownCandidate,
  options: DropdownOptionInfo[],
  sequence: number,
  folder: string,
): DropdownCaptureRecord {
  const priority = dropdownPriority(candidate, options);
  return {
    route,
    sequence,
    folderName: path.basename(folder),
    candidate,
    options,
    priority,
    issue: dropdownIssue(candidate, options),
    recommendedHtml: recommendedDropdownHtml(candidate, options),
  };
}

async function writeFilterDropdownMarkdown(outputDir: string, record: DropdownCaptureRecord): Promise<void> {
  const lines: string[] = [];
  const { route, candidate, options } = record;

  lines.push(`# Filter Dropdown - ${route.area} / ${route.page} / ${route.state}`);
  lines.push("");
  lines.push(`- Dropdown number: ${record.sequence}`);
  lines.push(`- Trigger visible text: ${candidate.label || "none"}`);
  lines.push(`- Trigger accessible name: ${candidate.accessibleName || "none"}`);
  lines.push(`- Trigger HTML tag: ${candidate.tag}`);
  lines.push(`- Trigger role: ${candidate.role ?? "none"}`);
  lines.push(`- Trigger id: ${candidate.id ?? "none"}`);
  lines.push(`- Trigger data-testid: ${candidate.dataTestId ?? "none"}`);
  lines.push(`- Trigger classes: ${candidate.classList.length ? candidate.classList.join(" ") : "none"}`);
  lines.push(`- aria-label: ${candidate.ariaLabel ?? "none"}`);
  lines.push(`- aria-haspopup: ${candidate.ariaHasPopup ?? "none"}`);
  lines.push(`- aria-controls: ${candidate.ariaControls ?? "none"}`);
  lines.push(`- aria-expanded: ${candidate.ariaExpanded ?? "none"}`);
  lines.push(`- Appears to be: ${candidate.kind}`);
  lines.push(`- Visible option count: ${options.length}`);
  lines.push(`- Priority: ${record.priority}`);
  lines.push("");
  lines.push("## Visible Options");
  lines.push("");
  if (options.length === 0) {
    lines.push("- No visible options detected.");
  } else {
    for (const option of options) {
      lines.push(`- ${option.index + 1}. ${option.text || "unnamed option"}`);
      lines.push(`  - tag: ${option.tag}`);
      lines.push(`  - role: ${option.role ?? "none"}`);
      lines.push(`  - id: ${option.id ?? "none"}`);
      lines.push(`  - data-testid: ${option.dataTestId ?? "none"}`);
      lines.push(`  - classes: ${option.classList.length ? option.classList.join(" ") : "none"}`);
      lines.push(`  - aria-selected: ${option.ariaSelected ?? "none"}`);
      lines.push(`  - aria-checked: ${option.ariaChecked ?? "none"}`);
      lines.push(`  - value present: ${option.valuePresent ? "yes" : "no"}`);
      lines.push(`  - recommended locator: \`${option.locator}\``);
    }
  }
  lines.push("");
  lines.push("## Missing Semantic Or Accessibility Attributes");
  lines.push("");
  for (const item of dropdownMissingAttributes(candidate, options)) {
    lines.push(`- ${item}`);
  }
  lines.push("");
  lines.push("## Recommended Improved HTML");
  lines.push("");
  lines.push("```html");
  lines.push(record.recommendedHtml);
  lines.push("```");
  lines.push("");
  lines.push("## Recommended Locator");
  lines.push("");
  lines.push(`- \`${recommendedDropdownLocator(candidate)}\``);
  lines.push("");
  lines.push("No option was clicked, selected, or applied during this capture.");
  lines.push("");

  await fs.writeFile(path.join(outputDir, "FILTER-DROPDOWN.md"), `${lines.join("\n")}\n`, "utf8");
}

function buildPredefinedFilterRecord(
  route: PredefinedFilterRouteConfig,
  filter: PredefinedFilterConfig,
  folderName: string,
  trigger: PredefinedElementInfo | null,
  openedSuccessfully: boolean,
  activeContainerFound: boolean,
  options: PredefinedOptionInfo[],
  showMore: PredefinedShowMoreResult,
): PredefinedFilterRecord {
  const issues = predefinedFilterIssues(trigger, openedSuccessfully, activeContainerFound, options, showMore);
  const locatorRisks = predefinedLocatorRisks(trigger, options);
  return {
    route,
    filter,
    folderName,
    triggerFound: trigger !== null,
    openedSuccessfully,
    optionsDetected: options.length > 0,
    optionCountBeforeShowMore: showMore.beforeCount,
    optionCountAfterShowMore: showMore.afterCount,
    showMoreClicks: showMore.clickCount,
    additionalOptionsRevealed: showMore.additionalOptions,
    activeContainerFound,
    trigger,
    options,
    priority: predefinedPriority(issues, locatorRisks),
    issues,
    locatorRisks,
  };
}

async function writePredefinedFilterFiles(
  page: Page,
  outputDir: string,
  route: PredefinedFilterRouteConfig,
  filter: PredefinedFilterConfig,
  detection: PredefinedFilterDetection,
  activeContainer: PredefinedActiveContainer,
  record: PredefinedFilterRecord,
  rawDropdownHtml: string,
): Promise<void> {
  const sanitizedDropdownHtml = sanitizeHtmlFragment(rawDropdownHtml);
  const interactive = await extractInteractiveForSelector(page, activeContainer.selector ?? detection.containerSelector);
  const accessibility = await runAccessibilityScanForSelector(page, activeContainer.selector ?? detection.containerSelector);

  await fs.writeFile(path.join(outputDir, "raw-dropdown-dom.html"), rawDropdownHtml, "utf8");
  await fs.writeFile(path.join(outputDir, "sanitized-dropdown-dom.html"), sanitizedDropdownHtml, "utf8");
  await fs.writeFile(
    path.join(outputDir, "dropdown-trigger.json"),
    `${JSON.stringify(
      {
        area: route.area,
        page: route.page,
        filterLabel: filter.label,
        filterType: filter.type,
        triggerFound: record.triggerFound,
        trigger: record.trigger,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  await fs.writeFile(path.join(outputDir, "dropdown-options.json"), `${JSON.stringify(record.options, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(outputDir, "interactive-elements.json"), `${JSON.stringify(interactive, null, 2)}\n`, "utf8");
  await fs.writeFile(
    path.join(outputDir, "accessibility-report.json"),
    `${JSON.stringify(accessibility, null, 2)}\n`,
    "utf8",
  );

  if (CAPTURE_SCREENSHOTS) {
    await page.screenshot({ path: path.join(outputDir, "full-page.png"), fullPage: true });
  }

  await fs.writeFile(
    path.join(outputDir, "FILTER-IMPROVEMENTS.md"),
    buildPredefinedFilterReport(route, filter, detection, activeContainer, record),
    "utf8",
  );
  await fs.writeFile(
    path.join(outputDir, "DIAGNOSTICS.md"),
    buildPredefinedFilterDiagnostics(route, filter, detection, activeContainer, record),
    "utf8",
  );
}

async function extractInteractiveForSelector(page: Page, selector?: string): Promise<InteractiveExtraction> {
  if (!selector) return { elements: [], shadowRoots: [], iframes: [] };
  try {
    return normalizeInteractiveExtraction(
      await page.locator(selector).locator(INTERACTIVE_SELECTOR).evaluateAll<InteractiveExtraction>(INTERACTIVE_EXTRACTION_FUNCTION),
    );
  } catch {
    return { elements: [], shadowRoots: [], iframes: [] };
  }
}

async function runAccessibilityScanForSelector(page: Page, selector?: string): Promise<AxeResult> {
  if (!selector) {
    return {
      violations: [],
      note: "Accessibility scan skipped because no active filter container was found.",
    };
  }

  try {
    const builder = new AxeBuilder({ page });
    builder.include(selector);
    return (await builder.analyze()) as unknown as AxeResult;
  } catch (error) {
    return {
      error: sanitizeError(error),
      violations: [],
    };
  }
}

async function getElementOuterHtml(page: Page, selector?: string): Promise<string> {
  if (!selector) return "<!-- no element captured -->";
  try {
    return await page.locator(selector).first().evaluate((element) => (element as HTMLElement).outerHTML);
  } catch {
    return "<!-- element could not be captured -->";
  }
}

function buildPredefinedFilterReport(
  route: PredefinedFilterRouteConfig,
  filter: PredefinedFilterConfig,
  detection: PredefinedFilterDetection,
  activeContainer: PredefinedActiveContainer,
  record: PredefinedFilterRecord,
): string {
  const lines: string[] = [];
  const duplicateIds = duplicatedValues(record.options.map((option) => option.id).filter(isPresent));
  const testIds = uniqueValues([
    record.trigger?.dataTestId ?? null,
    ...record.options.map((option) => option.dataTestId),
  ].filter(isPresent));
  const optionPatterns = groupPredefinedOptionPatterns(record.options);

  lines.push(`# Filter Improvements - ${route.area} / ${route.page} / ${filter.label}`);
  lines.push("");
  lines.push(`- Area: ${route.area}`);
  lines.push(`- Page: ${route.page}`);
  lines.push(`- Filter label: ${filter.label}`);
  lines.push(`- Filter type: ${filter.type}`);
  lines.push(`- Trigger found: ${record.triggerFound ? "yes" : "no"}`);
  lines.push(`- Dropdown opened successfully: ${record.openedSuccessfully ? "yes" : "no"}`);
  lines.push(`- Visible options detected: ${record.optionsDetected ? "yes" : "no"}`);
  lines.push(`- Total visible option count before clicking "weitere anzeigen": ${record.optionCountBeforeShowMore}`);
  lines.push(`- Total visible option count after clicking "weitere anzeigen": ${record.optionCountAfterShowMore}`);
  lines.push(`- Priority: ${record.priority}`);
  lines.push("");
  lines.push("## Trigger DOM Attributes");
  lines.push("");
  if (!record.trigger) {
    lines.push(`- Not found. Reason: ${detection.reason}`);
  } else {
    appendPredefinedElementAttributes(lines, record.trigger);
  }
  lines.push("");
  lines.push("## Option DOM Attributes Grouped By Repeated Pattern");
  lines.push("");
  if (optionPatterns.length === 0) {
    lines.push("- No rendered options detected.");
  } else {
    for (const pattern of optionPatterns) {
      lines.push(`- ${pattern.pattern}: ${pattern.count}`);
    }
  }
  lines.push("");
  lines.push("## Missing Semantic HTML");
  lines.push("");
  appendListOrNone(lines, record.issues.filter((issue) => issue.includes("semantic") || issue.includes("native") || issue.includes("role")));
  lines.push("");
  lines.push("## Missing Accessible Names");
  lines.push("");
  appendListOrNone(lines, record.issues.filter((issue) => issue.includes("accessible name")));
  lines.push("");
  lines.push("## Missing Or Unsuitable ARIA Attributes");
  lines.push("");
  appendListOrNone(lines, record.issues.filter((issue) => issue.includes("aria-") || issue.includes("ARIA")));
  lines.push("");
  lines.push("## Duplicate HTML IDs");
  lines.push("");
  appendListOrNone(lines, duplicateIds.map((id) => `Duplicate id detected: \`${id}\`.`));
  lines.push("");
  lines.push("## Existing Useful Data-testid Values");
  lines.push("");
  appendListOrNone(lines, testIds.map((testId) => `\`${testId}\``));
  lines.push("");
  lines.push("## Missing Recommended Data-testid Values");
  lines.push("");
  appendListOrNone(lines, record.locatorRisks.filter((risk) => risk.includes("data-testid")));
  lines.push("");
  lines.push("## CSS-Class-Only Locator Risks");
  lines.push("");
  appendListOrNone(lines, record.locatorRisks.filter((risk) => risk.includes("CSS") || risk.includes("class")));
  lines.push("");
  lines.push("## Representative Sanitized Current HTML Snippets");
  lines.push("");
  if (record.trigger) {
    lines.push("Trigger:");
    lines.push("");
    lines.push("```html");
    lines.push(record.trigger.htmlSnippet);
    lines.push("```");
  }
  for (const option of record.options.slice(0, 3)) {
    lines.push("");
    lines.push(`Option ${option.index + 1}:`);
    lines.push("");
    lines.push("```html");
    lines.push(option.htmlSnippet);
    lines.push("```");
  }
  if (!record.trigger && record.options.length === 0) {
    lines.push("- No current HTML snippet available.");
  }
  lines.push("");
  lines.push("## Recommended Improved HTML Snippets");
  lines.push("");
  lines.push("Trigger:");
  lines.push("");
  lines.push("```html");
  lines.push(recommendedPredefinedTriggerHtml(filter, record.trigger));
  lines.push("```");
  lines.push("");
  lines.push("Option:");
  lines.push("");
  lines.push("```html");
  lines.push(recommendedPredefinedOptionHtml(filter, record.options[0]));
  lines.push("```");
  lines.push("");
  lines.push("## Recommended Playwright Locators");
  lines.push("");
  lines.push(`- Trigger: \`${recommendedPredefinedTriggerLocator(filter, record.trigger)}\``);
  lines.push(`- Standard option: \`${recommendedPredefinedOptionLocator(record.options[0], "standard")}\``);
  lines.push(`- Searchable result option: \`${recommendedPredefinedOptionLocator(record.options[0], "searchable")}\``);
  lines.push("- \"weitere anzeigen\" button: `activeDropdown.getByRole('button', { name: /^weitere anzeigen$/i })`");
  lines.push("");
  lines.push("No option was clicked, selected, or applied during this capture.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}

function buildPredefinedFilterDiagnostics(
  route: PredefinedFilterRouteConfig,
  filter: PredefinedFilterConfig,
  detection: PredefinedFilterDetection,
  activeContainer: PredefinedActiveContainer,
  record: PredefinedFilterRecord,
): string {
  const lines: string[] = [];
  lines.push(`# Diagnostics - ${route.area} / ${route.page} / ${filter.label}`);
  lines.push("");
  lines.push(`- Detection reason: ${detection.reason}`);
  lines.push(`- Label match count: ${detection.labelMatchCount}`);
  lines.push(`- Active option container found: ${activeContainer.found ? "yes" : "no"}`);
  lines.push(`- Active option container reason: ${activeContainer.reason}`);
  lines.push(`- Trigger candidates considered: ${detection.candidates.length}`);
  lines.push(`- "weitere anzeigen" click count: ${record.showMoreClicks}`);
  lines.push(`- Additional options revealed: ${record.additionalOptionsRevealed}`);
  lines.push("");
  lines.push("## Trigger Candidates");
  lines.push("");
  if (detection.candidates.length === 0) {
    lines.push("- None.");
  } else {
    for (const [index, candidate] of detection.candidates.entries()) {
      lines.push(`- ${index + 1}. ${candidate.tag}; role=${candidate.role ?? "none"}; text=${markdownCell(candidate.visibleText ?? candidate.accessibleName ?? "none")}; selector=${markdownCell(candidate.selector)}`);
    }
  }
  lines.push("");
  lines.push("## Issues");
  lines.push("");
  appendListOrNone(lines, record.issues);
  lines.push("");
  lines.push("## Locator Risks");
  lines.push("");
  appendListOrNone(lines, record.locatorRisks);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function writeDropdownDiagnostics(
  runRoot: string,
  route: RouteConfig,
  detection: DropdownDetectionResult,
  openedOrInspectedCandidates: DropdownCandidate[],
  skippedCandidates: DropdownCandidate[],
): Promise<void> {
  const outputDir = path.join(runRoot, "pages", route.area, route.page, route.state);
  const lines: string[] = [];
  await fs.mkdir(outputDir, { recursive: true });

  lines.push(`# Dropdown Detection Diagnostics - ${route.area} / ${route.page} / ${route.state}`);
  lines.push("");
  lines.push("- The dropdown-only audit inspected only controls visible on the normal route page.");
  lines.push("- Full-filters overlay openers are intentionally skipped and are not clicked.");
  lines.push("- No options were clicked, selected, applied, reset, submitted, saved, or deleted.");
  lines.push("");
  lines.push("## Counts");
  lines.push("");
  lines.push(`- Visible elements scanned: ${detection.visibleScanned.length}`);
  lines.push(`- Candidates before exclusions: ${detection.candidatesBeforeExclusions.length}`);
  lines.push(`- Hard-excluded full-filters overlay controls: ${detection.hardExcludedOverlayOpeners.length}`);
  lines.push(`- Excluded action controls: ${detection.excludedActionControls.length}`);
  lines.push(`- Remaining dropdown candidates: ${detection.candidates.length}`);
  lines.push(`- Opened or inspected dropdowns: ${openedOrInspectedCandidates.length}`);
  lines.push(`- Skipped candidates: ${skippedCandidates.length}`);
  lines.push("");

  appendCandidateDiagnostics(lines, "Visible Elements Scanned", detection.visibleScanned, false);
  appendCandidateDiagnostics(lines, "Candidates Before Exclusions", detection.candidatesBeforeExclusions, true);
  appendCandidateDiagnostics(lines, "Hard-Excluded Alle Filter Overlay Openers", detection.hardExcludedOverlayOpeners, true);
  appendCandidateDiagnostics(lines, "Excluded Action Controls", detection.excludedActionControls, true);
  appendCandidateDiagnostics(lines, "Remaining Dropdown Candidates", detection.candidates, true);
  appendCandidateDiagnostics(lines, "Opened Or Inspected Dropdowns", openedOrInspectedCandidates, true);
  appendCandidateDiagnostics(lines, "Skipped Candidates", skippedCandidates, true);

  await fs.writeFile(path.join(outputDir, "DROPDOWN-DETECTION-DIAGNOSTICS.md"), `${lines.join("\n")}\n`, "utf8");
}

async function writeDropdownFailureDiagnostics(runRoot: string, route: RouteConfig, reason: string): Promise<void> {
  const outputDir = path.join(runRoot, "pages", route.area, route.page, route.state);
  const lines = [
    `# Dropdown Detection Diagnostics - ${route.area} / ${route.page} / ${route.state}`,
    "",
    "Route dropdown detection did not run successfully.",
    "",
    "## Failure",
    "",
    `- ${markdownCell(reason)}`,
    "",
    "No application controls were clicked after this failure.",
    "",
  ];
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "DROPDOWN-DETECTION-DIAGNOSTICS.md"), lines.join("\n"), "utf8");
}

function appendCandidateDiagnostics(
  lines: string[],
  title: string,
  candidates: DropdownCandidate[],
  includeReason: boolean,
): void {
  lines.push(`## ${title}`);
  lines.push("");
  if (candidates.length === 0) {
    lines.push("- None.");
    lines.push("");
    return;
  }

  lines.push(
    [
      "| #",
      "visible text",
      "tag",
      "role",
      "aria-haspopup",
      "aria-expanded",
      "aria-controls",
      "classes",
      includeReason ? "reason |" : " |",
    ].join(" | "),
  );
  lines.push(
    [
      "|---:",
      "---",
      "---",
      "---",
      "---",
      "---",
      "---",
      "---",
      includeReason ? "---|" : "---|",
    ].join("|"),
  );

  for (const [index, candidate] of candidates.entries()) {
    lines.push(
      [
        `| ${index + 1}`,
        markdownCell(firstPresent(candidate.label, candidate.accessibleName, candidate.ariaLabel) ?? "none"),
        markdownCell(candidate.tag),
        markdownCell(candidate.role ?? "none"),
        markdownCell(candidate.ariaHasPopup ?? "none"),
        markdownCell(candidate.ariaExpanded ?? "none"),
        markdownCell(candidate.ariaControls ? "present" : "none"),
        markdownCell(candidate.classList.slice(0, 8).join(" ") || "none"),
        includeReason ? `${markdownCell(candidate.reason ?? "candidate")} |` : " |",
      ].join(" | "),
    );
  }
  lines.push("");
}

async function writeSkippedControls(runRoot: string, skipped: SkippedControl[]): Promise<void> {
  const lines = ["# Skipped Controls", ""];
  if (skipped.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of skipped) {
      lines.push(`## ${item.area} / ${item.page} / ${item.state}`);
      lines.push("");
      lines.push(`- Candidate: ${item.description}`);
      lines.push(`- Reason: ${item.reason}`);
      lines.push(`- Manual review recommended: ${item.manualReview ? "yes" : "no"}`);
      lines.push("");
    }
  }
  await fs.writeFile(path.join(runRoot, "SKIPPED-CONTROLS.md"), `${lines.join("\n")}\n`, "utf8");
}

async function writeDropdownSummary(
  runRoot: string,
  stats: DropdownRouteStats[],
  skipped: SkippedControl[],
  captures: DropdownCaptureRecord[],
): Promise<void> {
  const priorityGroups = groupDropdownCaptures(captures);
  const lines: string[] = [];
  lines.push("# Dropdown Audit Summary");
  lines.push("");
  lines.push("Previous default-route audit output was preserved unchanged.");
  lines.push("The `alle Filter` / `all filters` full-filters overlay opener is intentionally excluded so this run inspects only individual filter dropdowns visible on the normal route page.");
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Total configured routes: ${stats.length}`);
  lines.push(`- Routes inspected: ${stats.filter((stat) => !stat.failed).length}`);
  lines.push(`- Routes with at least one opened dropdown: ${stats.filter((stat) => stat.openedDropdowns > 0).length}`);
  lines.push(`- Routes with zero opened dropdowns: ${stats.filter((stat) => stat.openedDropdowns === 0).length}`);
  lines.push(`- Total candidates: ${sum(stats, "detectedDropdowns")}`);
  lines.push(`- Total opened dropdowns: ${sum(stats, "openedDropdowns")}`);
  lines.push(`- Native selects inspected without clicking: ${sum(stats, "nativeSelects")}`);
  lines.push(`- Total skipped controls: ${sum(stats, "skippedDropdowns")}`);
  lines.push(`- Intentionally excluded full-filters overlay controls: ${sum(stats, "hardExcludedOverlayOpeners")}`);
  lines.push("");
  lines.push("## Audited Routes");
  lines.push("");
  for (const stat of stats) {
    lines.push(
      `- ${stat.route.area} / ${stat.route.page} / ${stat.route.state}: candidates ${stat.detectedDropdowns}, opened ${stat.openedDropdowns}, native selects ${stat.nativeSelects}, skipped ${stat.skippedDropdowns}, intentionally excluded full-filters controls ${stat.hardExcludedOverlayOpeners}`,
    );
  }
  lines.push("");
  lines.push("## Skipped Routes");
  lines.push("");
  const failedRoutes = stats.filter((stat) => stat.failed);
  if (failedRoutes.length === 0) {
    lines.push("- None.");
  } else {
    for (const stat of failedRoutes) {
      lines.push(`- ${stat.route.area} / ${stat.route.page} / ${stat.route.state}: ${stat.failed}`);
    }
  }
  lines.push("");
  lines.push("## Repeated Dropdown Issues");
  lines.push("");
  if (priorityGroups.length === 0) {
    lines.push("- None detected.");
  } else {
    for (const group of priorityGroups) {
      lines.push(`- ${group.issue}: ${group.count}; priority: ${group.priority}`);
    }
  }
  lines.push("");
  appendDropdownPriority(lines, captures, "High");
  appendDropdownPriority(lines, captures, "Medium");
  appendDropdownPriority(lines, captures, "Low");
  lines.push("## Representative Current And Improved HTML");
  lines.push("");
  for (const record of captures.slice(0, 6)) {
    lines.push(`### ${record.route.area} / ${record.route.page} / ${record.folderName}`);
    lines.push("");
    lines.push("Current trigger:");
    lines.push("");
    lines.push("```html");
    lines.push(currentDropdownSnippet(record.candidate));
    lines.push("```");
    lines.push("");
    lines.push("Improved:");
    lines.push("");
    lines.push("```html");
    lines.push(record.recommendedHtml);
    lines.push("```");
    lines.push("");
  }
  lines.push("## Recommended Playwright Locator Examples");
  lines.push("");
  for (const record of captures.slice(0, 10)) {
    lines.push(`- \`${recommendedDropdownLocator(record.candidate)}\``);
  }
  lines.push("");
  lines.push("## Frontend Technical Task");
  lines.push("");
  lines.push("Improve D2D filter dropdown semantics so filter triggers and options expose stable roles, names, expanded/selected state, and reliable Playwright locators without requiring generated CSS selectors.");
  lines.push("");
  lines.push("## Acceptance Criteria");
  lines.push("");
  lines.push("- Filter dropdown triggers use native `select` or meaningful combobox/listbox/menu semantics.");
  lines.push("- Trigger accessible names are available through visible labels or ARIA relationships.");
  lines.push("- `aria-expanded` updates when custom dropdowns open and close.");
  lines.push("- `aria-controls` links custom triggers to their popup/list where appropriate.");
  lines.push("- Options expose `role=\"option\"` or `role=\"menuitem\"` as appropriate, with selected/checked state when needed.");
  lines.push("- Tests can prefer `getByRole()`, `getByLabel()`, `getByText()`, or scoped `getByTestId()` without XPath.");
  lines.push("- No filter option is selected or applied by the audit utility.");
  lines.push("");

  await fs.writeFile(path.join(runRoot, "SUMMARY.md"), `${lines.join("\n")}\n`, "utf8");
}

async function writePredefinedMissingOrSkipped(
  runRoot: string,
  missingOrSkipped: MissingOrSkippedFilter[],
): Promise<void> {
  const lines: string[] = ["# Missing Or Skipped Filters", ""];
  if (missingOrSkipped.length === 0) {
    lines.push("- None.");
  } else {
    for (const item of missingOrSkipped) {
      lines.push(`## ${item.area} / ${item.page} / ${item.label}`);
      lines.push("");
      lines.push(`- Reason: ${item.reason}`);
      lines.push(`- Optional: ${item.optional ? "yes" : "no"}`);
      lines.push("");
    }
  }
  await fs.writeFile(path.join(runRoot, "MISSING-OR-SKIPPED-FILTERS.md"), `${lines.join("\n")}\n`, "utf8");
}

async function writePredefinedSummary(
  runRoot: string,
  stats: PredefinedPageStats[],
  records: PredefinedFilterRecord[],
  missingOrSkipped: MissingOrSkippedFilter[],
): Promise<void> {
  const issueGroups = groupTextCounts(records.flatMap((record) => record.issues));
  const locatorGroups = groupTextCounts(records.flatMap((record) => record.locatorRisks));
  const lines: string[] = [];

  lines.push("# Predefined Filter Audit Summary");
  lines.push("");
  lines.push("All previous audit files were preserved unchanged. This run wrote only inside this timestamped predefined-filter audit folder.");
  lines.push("");
  lines.push("## Audited Pages");
  lines.push("");
  for (const stat of stats) {
    lines.push(`- ${stat.route.area} / ${stat.route.page}: configured filters ${stat.configuredFilterCount}, found ${stat.foundFilterCount}, opened or inspected ${stat.openedDropdownCount + stat.searchableDropdownCount}, options ${stat.inspectedOptionCount}, skipped ${stat.skippedFilterCount}`);
  }
  lines.push("");
  lines.push("## Totals");
  lines.push("");
  lines.push(`- Total configured filters: ${records.length}`);
  lines.push(`- Filters found: ${records.filter((record) => record.triggerFound).length}`);
  lines.push(`- Filters missing: ${missingOrSkipped.filter((item) => item.reason.includes("not found") || item.reason.includes("not be found")).length}`);
  lines.push(`- Dropdowns opened successfully: ${records.filter((record) => record.filter.type === "dropdown" && record.openedSuccessfully).length}`);
  lines.push(`- Searchable dropdowns inspected successfully: ${records.filter((record) => record.filter.type === "searchable-dropdown" && record.openedSuccessfully).length}`);
  lines.push(`- Total option elements inspected: ${records.reduce((total, record) => total + record.options.length, 0)}`);
  lines.push(`- Filters containing "weitere anzeigen": ${records.filter((record) => record.showMoreClicks > 0).length}`);
  lines.push(`- Total additional options revealed: ${records.reduce((total, record) => total + record.additionalOptionsRevealed, 0)}`);
  lines.push("");
  lines.push("## Repeated Semantic And Accessibility Issues");
  lines.push("");
  appendCountGroups(lines, issueGroups);
  lines.push("");
  lines.push("## Repeated Locator-Stability Risks");
  lines.push("");
  appendCountGroups(lines, locatorGroups);
  lines.push("");
  appendPredefinedPrioritySection(lines, "High", records);
  appendPredefinedPrioritySection(lines, "Medium", records);
  appendPredefinedPrioritySection(lines, "Low", records);
  lines.push("## Representative Current And Improved HTML Snippets");
  lines.push("");
  for (const record of records.filter((item) => item.trigger).slice(0, 5)) {
    lines.push(`### ${record.route.area} / ${record.route.page} / ${record.filter.label}`);
    lines.push("");
    lines.push("Current:");
    lines.push("");
    lines.push("```html");
    lines.push(record.trigger?.htmlSnippet ?? "");
    lines.push("```");
    lines.push("");
    lines.push("Improved:");
    lines.push("");
    lines.push("```html");
    lines.push(recommendedPredefinedTriggerHtml(record.filter, record.trigger));
    lines.push("```");
    lines.push("");
  }
  lines.push("## Recommended Playwright Locator Examples");
  lines.push("");
  for (const record of records.filter((item) => item.trigger).slice(0, 10)) {
    lines.push(`- ${record.route.area} / ${record.route.page}: \`${recommendedPredefinedTriggerLocator(record.filter, record.trigger)}\``);
  }
  lines.push("");
  lines.push("## Frontend Technical Task");
  lines.push("");
  lines.push("Improve predefined list-view filter dropdowns so each configured filter can be located by a stable label or role, opened without global nth selectors, and inspected through semantic option containers with meaningful option roles, names, state, and scoped locators.");
  lines.push("");
  lines.push("## Acceptance Criteria");
  lines.push("");
  lines.push("- Each configured filter has an explicit visible label connected to its input, select, combobox, or trigger.");
  lines.push("- Custom dropdown triggers expose meaningful accessible names plus `aria-expanded` and `aria-controls` when applicable.");
  lines.push("- Rendered options expose native `option` or ARIA option/menuitem semantics with selected or checked state when meaningful.");
  lines.push("- Searchable dropdown result lists render in a container associated with the configured input.");
  lines.push("- The `weitere anzeigen` control is scoped inside the dropdown option container and can be located by role and name.");
  lines.push("- Playwright tests can prefer `getByRole()`, `getByLabel()`, `getByText()`, or scoped `getByTestId()` without XPath.");
  lines.push("- No internal URLs, raw DOM, credentials, tokens, or customer-specific values are committed.");
  lines.push("");

  await fs.writeFile(path.join(runRoot, "SUMMARY.md"), `${lines.join("\n")}\n`, "utf8");
}

function predefinedFilterIssues(
  trigger: PredefinedElementInfo | null,
  openedSuccessfully: boolean,
  activeContainerFound: boolean,
  options: PredefinedOptionInfo[],
  showMore: PredefinedShowMoreResult,
): string[] {
  const issues: string[] = [];
  if (!trigger) {
    issues.push("Configured filter trigger was not found safely.");
    return issues;
  }
  if (!firstPresent(trigger.visibleText, trigger.accessibleName, trigger.ariaLabel, trigger.associatedLabelText)) {
    issues.push("Trigger is missing a meaningful accessible name.");
  }
  if (trigger.tag !== "select" && !trigger.ariaExpanded) {
    issues.push("Custom dropdown trigger should expose aria-expanded.");
  }
  if (trigger.tag !== "select" && !trigger.ariaControls) {
    issues.push("Custom dropdown trigger should expose aria-controls for its popup/list when applicable.");
  }
  if (!openedSuccessfully) {
    issues.push("Dropdown options were not rendered or detected successfully.");
  }
  if (!activeContainerFound) {
    issues.push("Active dropdown option container could not be associated with the configured filter.");
  }
  if (options.some((option) => !option.role && option.tag !== "option")) {
    issues.push("Rendered options should expose native option elements or ARIA option/menuitem roles.");
  }
  if (options.some((option) => !firstPresent(option.text, option.accessibleName, option.ariaLabel))) {
    issues.push("One or more rendered options are missing accessible names.");
  }
  if (duplicatedValues(options.map((option) => option.id).filter(isPresent)).length > 0) {
    issues.push("Duplicate HTML id values were detected inside rendered dropdown options.");
  }
  if (showMore.issue) {
    issues.push(showMore.issue);
  }
  if (issues.length === 0) {
    issues.push("No high-risk semantic issue detected from this filter capture.");
  }
  return issues;
}

function predefinedLocatorRisks(trigger: PredefinedElementInfo | null, options: PredefinedOptionInfo[]): string[] {
  const risks: string[] = [];
  if (trigger && !firstPresent(trigger.visibleText, trigger.accessibleName, trigger.ariaLabel, trigger.associatedLabelText) && !trigger.dataTestId) {
    risks.push("Trigger risks requiring a CSS-class-only locator; add a meaningful name or scoped data-testid.");
  }
  if (trigger && trigger.selector.length > 220 && !trigger.dataTestId) {
    risks.push("Trigger diagnostic selector is long; prefer user-facing locators or a stable data-testid fallback.");
  }
  if (options.some((option) => !firstPresent(option.text, option.accessibleName, option.ariaLabel) && !option.dataTestId)) {
    risks.push("Some options risk requiring CSS-class-only locators; expose text, role/name, or scoped data-testid values.");
  }
  if (options.some((option) => option.diagnosticDomPath.length > 260 && !option.dataTestId)) {
    risks.push("Some option DOM paths are long; add stable option semantics or scoped test attributes.");
  }
  if (risks.length === 0) {
    risks.push("No obvious locator-stability risk detected from this filter capture.");
  }
  return risks;
}

function predefinedPriority(issues: string[], locatorRisks: string[]): Priority {
  const combined = [...issues, ...locatorRisks].join(" ").toLowerCase();
  if (combined.includes("not found") || combined.includes("not rendered") || combined.includes("duplicate html id") || combined.includes("missing a meaningful accessible name")) {
    return "High";
  }
  if (combined.includes("aria-") || combined.includes("css-class-only") || combined.includes("option")) {
    return "Medium";
  }
  return "Low";
}

function recommendedPredefinedTriggerHtml(filter: PredefinedFilterConfig, trigger: PredefinedElementInfo | null): string {
  const name = escapeHtml(filter.label);
  const testId = trigger?.dataTestId ? ` data-testid="${escapeHtml(trigger.dataTestId)}"` : "";
  if (filter.type === "searchable-dropdown") {
    return `<label for="${slugify(filter.label)}-filter">${name}</label>\n<input id="${slugify(filter.label)}-filter" type="search" role="combobox" aria-expanded="false" aria-controls="${slugify(filter.label)}-options"${testId} />`;
  }
  if (trigger?.tag === "select") {
    return `<label for="${slugify(filter.label)}-filter">${name}</label>\n<select id="${slugify(filter.label)}-filter"${testId}>\n  <option>Option label</option>\n</select>`;
  }
  return `<button type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${slugify(filter.label)}-options"${testId}>${name}</button>`;
}

function recommendedPredefinedOptionHtml(filter: PredefinedFilterConfig, option?: PredefinedOptionInfo): string {
  const text = escapeHtml(firstPresent(option?.text, option?.accessibleName, option?.ariaLabel) ?? "Option label");
  if (filter.type === "searchable-dropdown") {
    return `<li role="option" data-${slugify(filter.label)}-id="{stable-business-id}">${text}</li>`;
  }
  return `<li role="option" aria-selected="${escapeHtml(option?.ariaSelected ?? "false")}">${text}</li>`;
}

function recommendedPredefinedTriggerLocator(filter: PredefinedFilterConfig, trigger: PredefinedElementInfo | null): string {
  const name = firstPresent(trigger?.associatedLabelText, trigger?.accessibleName, trigger?.visibleText, trigger?.ariaLabel, filter.label);
  if (filter.type === "searchable-dropdown") return `page.getByLabel(${quote(name ?? filter.label)})`;
  if (trigger?.tag === "select") return `page.getByLabel(${quote(name ?? filter.label)})`;
  if (name) return `page.getByRole('button', { name: ${regex(name)} })`;
  if (trigger?.dataTestId) return `page.getByTestId(${quote(trigger.dataTestId)})`;
  return "Use a scoped getByTestId() after adding a stable filter trigger test id.";
}

function recommendedPredefinedOptionLocator(option: PredefinedOptionInfo | undefined, mode: "standard" | "searchable"): string {
  const name = firstPresent(option?.text, option?.accessibleName, option?.ariaLabel);
  if (option?.role && name) return `activeDropdown.getByRole('${option.role}', { name: ${regex(name)} })`;
  if (name && mode === "standard") return `activeDropdown.getByText(${quote(name)})`;
  if (name && mode === "searchable") return `activeDropdown.getByRole('option', { name: ${regex(name)} })`;
  if (option?.dataTestId) return `activeDropdown.getByTestId(${quote(option.dataTestId)})`;
  return "Use a scoped getByTestId() or stable business attribute inside the active dropdown.";
}

function appendPredefinedElementAttributes(lines: string[], element: PredefinedElementInfo): void {
  lines.push(`- HTML tag: ${element.tag}`);
  lines.push(`- Role: ${element.role ?? "none"}`);
  lines.push(`- Visible text: ${element.visibleText ?? "none"}`);
  lines.push(`- Accessible name: ${element.accessibleName ?? "none"}`);
  lines.push(`- id: ${element.id ?? "none"}`);
  lines.push(`- name: ${element.name ?? "none"}`);
  lines.push(`- placeholder: ${element.placeholder ?? "none"}`);
  lines.push(`- title: ${element.title ?? "none"}`);
  lines.push(`- CSS classes: ${element.classList.length ? element.classList.join(" ") : "none"}`);
  lines.push(`- aria-label: ${element.ariaLabel ?? "none"}`);
  lines.push(`- aria-labelledby: ${element.ariaLabelledBy ?? "none"}`);
  lines.push(`- aria-describedby: ${element.ariaDescribedBy ?? "none"}`);
  lines.push(`- aria-expanded: ${element.ariaExpanded ?? "none"}`);
  lines.push(`- aria-controls: ${element.ariaControls ?? "none"}`);
  lines.push(`- data-testid: ${element.dataTestId ?? "none"}`);
  lines.push(`- associated label text: ${element.associatedLabelText ?? "none"}`);
  lines.push(`- diagnostic DOM path: ${element.diagnosticDomPath}`);
}

function groupPredefinedOptionPatterns(options: PredefinedOptionInfo[]): Array<{ pattern: string; count: number }> {
  const counts = new Map<string, number>();
  for (const option of options) {
    const pattern = `${option.tag}; role=${option.role ?? "none"}; classes=${option.classList.slice(0, 3).join(" ") || "none"}; data-testid=${option.dataTestId ?? "none"}`;
    counts.set(pattern, (counts.get(pattern) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([pattern, count]) => ({ pattern, count }))
    .sort((a, b) => b.count - a.count || a.pattern.localeCompare(b.pattern));
}

function groupTextCounts(values: string[]): Array<{ text: string; count: number }> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count || a.text.localeCompare(b.text));
}

function appendCountGroups(lines: string[], groups: Array<{ text: string; count: number }>): void {
  if (groups.length === 0) {
    lines.push("- None detected.");
  } else {
    for (const group of groups.slice(0, 20)) {
      lines.push(`- ${group.text}: ${group.count}`);
    }
  }
}

function appendPredefinedPrioritySection(lines: string[], priority: Priority, records: PredefinedFilterRecord[]): void {
  lines.push(`## ${priority}-Priority Frontend Improvements`);
  lines.push("");
  const matching = records.filter((record) => record.priority === priority);
  if (matching.length === 0) {
    lines.push("- None detected.");
  } else {
    for (const record of matching.slice(0, 20)) {
      lines.push(`- ${record.route.area} / ${record.route.page} / ${record.filter.label}: ${record.issues[0] ?? "Review filter semantics."}`);
    }
  }
  lines.push("");
}

function appendListOrNone(lines: string[], items: string[]): void {
  if (items.length === 0) {
    lines.push("- None detected.");
    return;
  }
  for (const item of uniqueValues(items)) {
    lines.push(`- ${item}`);
  }
}

function duplicatedValues(values: string[]): string[] {
  const counts = countValues(values);
  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .map(([value]) => value);
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values));
}

async function runAccessibilityScan(page: Page): Promise<AxeResult> {
  try {
    return (await new AxeBuilder({ page }).analyze()) as unknown as AxeResult;
  } catch (error) {
    return {
      error: sanitizeError(error),
      violations: [],
    };
  }
}

function buildRouteReport(
  route: RouteConfig,
  interactive: InteractiveExtraction,
  accessibility: AxeResult,
  manual: boolean,
): string {
  const elements = interactive.elements;
  const idCounts = countValues(elements.map((element) => element.id).filter(isPresent));
  const testIdCounts = countValues(elements.map((element) => element.dataTestId).filter(isPresent));
  const analyses = elements.map((element) => analyzeElement(element, idCounts, testIdCounts));
  const issueGroups = groupAnalyses(analyses);
  const violations = accessibility.violations ?? [];
  const usefulTestIds = Array.from(testIdCounts.keys()).sort();
  const missingTestIds = analyses.filter((analysis) => analysis.dataTestIdRecommended).slice(0, 20);
  const representative = analyses.filter((analysis) => analysis.issue !== "No obvious issue from this static DOM capture.").slice(0, 12);
  const lines: string[] = [];

  lines.push(`# UI Improvements - ${route.area} / ${route.page} / ${route.state}`);
  lines.push("");
  lines.push(`- Capture type: ${manual ? "manual hidden-state capture" : "configured route sweep"}`);
  lines.push(`- Total interactive elements: ${elements.length}`);
  lines.push(`- Open shadow roots detected: ${interactive.shadowRoots.length}`);
  lines.push(`- Iframes detected: ${interactive.iframes.length}`);
  lines.push("- Raw DOM remains local in `raw-dom.html` and is not included here.");
  lines.push("");
  lines.push("## Accessibility Violations By Rule");
  lines.push("");
  if (violations.length === 0) {
    lines.push("- No axe violations reported for this captured state.");
  } else {
    for (const violation of violations) {
      lines.push(`- ${violation.id}: ${violation.impact ?? "unknown impact"}; nodes: ${violation.nodes?.length ?? 0}`);
    }
  }
  lines.push("");
  lines.push("## Repeated Issues");
  lines.push("");
  appendIssueGroup(lines, "Elements with missing labels", issueGroups, "missing-label");
  appendIssueGroup(lines, "Icon-only controls without meaningful accessible names", issueGroups, "icon-only");
  appendIssueGroup(lines, "Duplicate HTML id values", issueGroups, "duplicate-id");
  appendIssueGroup(lines, "CSS-class-only locator risks", issueGroups, "css-class-only");
  appendIssueGroup(lines, "Long DOM-path locator risks", issueGroups, "long-dom-path");
  appendIssueGroup(lines, "Generic div elements that behave like buttons", issueGroups, "div-button");
  appendIssueGroup(lines, "Custom dropdown-like components", issueGroups, "custom-dropdown");
  lines.push("");
  lines.push("## Existing Useful Data-testid Values");
  lines.push("");
  if (usefulTestIds.length === 0) {
    lines.push("- None detected.");
  } else {
    for (const testId of usefulTestIds.slice(0, 40)) {
      const count = testIdCounts.get(testId) ?? 0;
      lines.push(`- \`${testId}\`${count > 1 ? `, repeated ${count} times` : ""}`);
    }
  }
  lines.push("");
  lines.push("## Missing Recommended Data-testid Values");
  lines.push("");
  if (missingTestIds.length === 0) {
    lines.push("- No additional data-testid values are recommended from this static capture.");
  } else {
    for (const analysis of missingTestIds) {
      lines.push(`- ${analysis.category}: ${analysis.issue} Recommended locator: \`${analysis.recommendedLocator}\``);
    }
  }
  lines.push("");
  lines.push("## Representative Recommendations");
  lines.push("");
  if (representative.length === 0) {
    lines.push("- No representative improvement examples were generated for this state.");
  } else {
    for (const analysis of representative) {
      lines.push(`### ${analysis.category} - ${analysis.priority}`);
      lines.push("");
      lines.push(`Issue: ${analysis.issue}`);
      lines.push("");
      lines.push("Current sanitized snippet:");
      lines.push("");
      lines.push("```html");
      lines.push(analysis.element.htmlSnippet);
      lines.push("```");
      lines.push("");
      lines.push("Recommended improved snippet:");
      lines.push("");
      lines.push("```html");
      lines.push(analysis.recommendedHtml);
      lines.push("```");
      lines.push("");
      lines.push(`Recommended Playwright locator: \`${analysis.recommendedLocator}\``);
      lines.push(`Preferred locator type: ${analysis.locatorStrategy}`);
      lines.push(`Unique id required: ${analysis.uniqueIdRequired ? "Yes" : "No"}`);
      lines.push(`aria-label required: ${analysis.ariaLabelRequired ? "Yes" : "No"}`);
      lines.push(`data-testid recommended: ${analysis.dataTestIdRecommended ? "Yes" : "No"}`);
      lines.push("");
    }
  }

  return `${lines.join("\n")}\n`;
}

function analyzeElement(
  element: InteractiveElement,
  idCounts: Map<string, number>,
  testIdCounts: Map<string, number>,
): ElementAnalysis & { element: InteractiveElement; issueKey: string } {
  const category = getCategory(element);
  const name = bestName(element, category);
  const role = roleForLocator(element, category);
  const nativeInteractive = ["button", "a", "input", "textarea", "select", "option", "summary"].includes(element.tag);
  const hasName = Boolean(element.accessibleName || element.visibleText || element.ariaLabel || element.ariaLabelledBy);
  const hasLabel = Boolean(element.associatedLabelText || element.ariaLabel || element.ariaLabelledBy);
  const duplicateId = Boolean(element.id && (idCounts.get(element.id) ?? 0) > 1);
  const cssOnlyRisk = !hasName && !element.id && !element.dataTestId && element.classList.length > 0;
  const longDomPath = element.diagnosticDomPath.length > 260;
  const iconOnly = (category === "icon-only button" || category === "row action button") && !hasName;
  const formMissingLabel = ["input", "textarea", "select"].includes(element.tag) && !hasLabel;
  const divButton = element.tag === "div" && element.role === "button";
  const customDropdown = isCustomDropdown(element, category);
  const repeatedTestId = Boolean(element.dataTestId && (testIdCounts.get(element.dataTestId) ?? 0) > 1);

  let issue = "No obvious issue from this static DOM capture.";
  let issueKey = "none";
  let priority: Priority = "Low";
  let uniqueIdRequired = false;
  let ariaLabelRequired = false;
  let dataTestIdRecommended = false;

  if (duplicateId) {
    issue = "Duplicate HTML id value detected.";
    issueKey = "duplicate-id";
    priority = "High";
    uniqueIdRequired = true;
  } else if (formMissingLabel) {
    issue = "Form control is missing a visible label or accessible name.";
    issueKey = "missing-label";
    priority = "High";
    uniqueIdRequired = !element.id;
  } else if (iconOnly) {
    issue = "Icon-only control has no meaningful accessible name.";
    issueKey = "icon-only";
    priority = "High";
    ariaLabelRequired = true;
    dataTestIdRecommended = true;
  } else if (divButton) {
    issue = "Generic div behaves like a button; prefer a native button.";
    issueKey = "div-button";
    priority = "High";
  } else if (customDropdown) {
    issue = "Custom dropdown-like component should expose stable roles, names, and expanded/selected state.";
    issueKey = "custom-dropdown";
    priority = "Medium";
    dataTestIdRecommended = !hasName;
  } else if (cssOnlyRisk) {
    issue = "Element currently risks requiring CSS-class-only locators.";
    issueKey = "css-class-only";
    priority = "Medium";
    dataTestIdRecommended = true;
  } else if (longDomPath) {
    issue = "Diagnostic DOM path is long and would be brittle as a locator.";
    issueKey = "long-dom-path";
    priority = "Medium";
  } else if (element.appearsDisabled && !element.disabled) {
    issue = "Element appears disabled by class name but lacks semantic disabled or aria-disabled state.";
    issueKey = "semantic-disabled";
    priority = "Medium";
  } else if (repeatedTestId) {
    issue = "data-testid is repeated; scope repeated collection locators by row, card, option, or stable business attribute.";
    issueKey = "repeated-testid";
    priority = "Low";
  } else if (!nativeInteractive && role && ["menuitem", "option", "tab"].includes(role)) {
    issue = `ARIA ${role} is implemented on a non-native ${element.tag}; verify keyboard behavior and consider native controls.`;
    issueKey = role === "tab" ? "custom-tab" : "custom-dropdown";
    priority = role === "tab" ? "High" : "Medium";
  }

  const recommendedHtml = recommendedHtmlFor(element, category, name, { ariaLabelRequired, dataTestIdRecommended });
  const locator = recommendedLocatorFor(element, category, name, role, { dataTestIdRecommended });

  return {
    element,
    category,
    issue,
    issueKey,
    priority,
    recommendedHtml,
    recommendedLocator: locator.locator,
    locatorStrategy: locator.strategy,
    uniqueIdRequired,
    ariaLabelRequired,
    dataTestIdRecommended,
  };
}

function getCategory(element: InteractiveElement): string {
  const classText = element.classList.join(" ").toLowerCase();
  const pathText = element.diagnosticDomPath.toLowerCase();
  const name = element.visibleText || element.accessibleName || "";
  const inTable = pathText.includes("table") || pathText.includes("tbody") || pathText.includes("tr.");
  const iconLike = !name && (classText.includes("icon") || classText.includes("lupe") || classText.includes("button"));

  if (inTable && (element.role === "button" || element.tag === "button")) return "row action button";
  if ((element.tag === "button" || element.role === "button") && iconLike) return "icon-only button";
  if (element.ariaExpanded !== null || classText.includes("select") || classText.includes("dropdown")) return "dropdown trigger";
  if (element.tag === "button" || element.role === "button") return "standard button";
  if (element.tag === "a") return "link";
  if (element.tag === "input" || element.tag === "textarea") {
    const combined = [element.type, element.id, element.name, element.placeholder, classText].filter(Boolean).join(" ").toLowerCase();
    return combined.includes("search") ? "search field" : "form field";
  }
  if (element.tag === "select") return "select field";
  if (element.tag === "option" || element.role === "option" || element.role === "menuitem") return "dropdown option";
  if (element.role === "tab") return "tab";
  if (element.role === "row" || inTable) return "table row";
  if (element.tag === "summary") return "summary disclosure";
  return element.role ? `${element.role} element` : "interactive element";
}

function isCustomDropdown(element: InteractiveElement, category: string): boolean {
  const classText = element.classList.join(" ").toLowerCase();
  return (
    category === "dropdown trigger" ||
    category === "dropdown option" ||
    element.role === "menuitem" ||
    element.role === "option" ||
    classText.includes("select") ||
    classText.includes("dropdown")
  );
}

function roleForLocator(element: InteractiveElement, category: string): string | null {
  if (element.role) return element.role;
  if (category === "search field" || category === "form field") return "textbox";
  if (category === "select field") return "combobox";
  if (category.includes("button") || category === "dropdown trigger" || element.tag === "summary") return "button";
  if (category === "link") return "link";
  if (category === "dropdown option") return "option";
  if (category === "tab") return "tab";
  if (element.tag === "textarea") return "textbox";
  if (element.tag === "option") return "option";
  return null;
}

function bestName(element: InteractiveElement, category: string): string {
  const direct = firstPresent(
    element.accessibleName,
    element.visibleText,
    element.associatedLabelText,
    element.ariaLabel,
    element.placeholder,
    element.title,
    element.name,
    element.id,
  );

  if (direct) return direct;
  if (category === "search field") return "Search";
  if (category === "dropdown trigger") return "Open dropdown";
  if (category === "dropdown option") return "Option label";
  if (category === "row action button") return "Open row details";
  if (category === "icon-only button") return "Describe action";
  if (category === "tab") return "Tab label";
  return "Meaningful control name";
}

function recommendedHtmlFor(
  element: InteractiveElement,
  category: string,
  name: string,
  options: { ariaLabelRequired: boolean; dataTestIdRecommended: boolean },
): string {
  const safeName = escapeHtml(name);
  const testId = suggestTestId(element, category);
  const dataTestId = options.dataTestIdRecommended ? ` data-testid="${escapeHtml(testId)}"` : "";

  if (category === "search field") {
    const id = stableId(element.id) ? element.id : "d2d-search-field";
    return `<label for="${escapeHtml(id)}">${safeName}</label>\n<input id="${escapeHtml(id)}" type="search" />`;
  }
  if (category === "form field" || category === "select field") {
    const id = stableId(element.id) ? element.id : "field-id";
    const tag = category === "select field" ? "select" : "input";
    const type = tag === "input" ? ` type="${escapeHtml(element.type ?? "text")}"` : "";
    return `<label for="${escapeHtml(id)}">${safeName}</label>\n<${tag} id="${escapeHtml(id)}"${type}></${tag}>`;
  }
  if (category === "icon-only button" || category === "row action button") {
    return `<button type="button" aria-label="${safeName}"${dataTestId}>\n  <span class="icon" aria-hidden="true"></span>\n</button>`;
  }
  if (category === "dropdown trigger") {
    const controls = stableId(element.ariaControls) ? element.ariaControls : "dropdown-options";
    return `<button type="button" aria-expanded="${escapeHtml(element.ariaExpanded ?? "false")}" aria-controls="${escapeHtml(controls ?? "dropdown-options")}">${safeName}</button>`;
  }
  if (category === "dropdown option") return `<button type="button" role="option">${safeName}</button>`;
  if (category === "tab") return `<button type="button" role="tab" aria-selected="${escapeHtml(element.ariaSelected ?? "false")}" aria-controls="tab-panel-id">${safeName}</button>`;
  if (category === "table row") return `<tr data-object-id="{stable-business-id}">\n  <td>${safeName}</td>\n</tr>`;
  if (category === "link") return `<a href="/stable-route">${safeName}</a>`;
  if (element.role === "button" || element.tag === "button") return `<button type="button">${safeName}</button>`;
  return `<${escapeHtml(element.tag)}>${safeName}</${escapeHtml(element.tag)}>`;
}

function recommendedLocatorFor(
  element: InteractiveElement,
  category: string,
  name: string,
  role: string | null,
  options: { dataTestIdRecommended: boolean },
): { locator: string; strategy: LocatorStrategy } {
  if (["search field", "form field", "select field"].includes(category)) {
    if (element.associatedLabelText || element.ariaLabel || element.ariaLabelledBy || category !== "form field") {
      return { locator: `page.getByLabel(${quote(name)})`, strategy: "getByLabel()" };
    }
    if (element.placeholder) return { locator: `page.getByPlaceholder(${quote(element.placeholder)})`, strategy: "getByPlaceholder()" };
  }

  if (role && name) {
    return { locator: `page.getByRole('${role}', { name: ${regex(name)} })`, strategy: "getByRole()" };
  }
  if (element.visibleText) return { locator: `page.getByText(${quote(element.visibleText)})`, strategy: "getByText()" };
  if (options.dataTestIdRecommended || element.dataTestId) {
    return { locator: `page.getByTestId(${quote(element.dataTestId ?? suggestTestId(element, category))})`, strategy: "getByTestId()" };
  }
  if (stableId(element.id)) return { locator: `page.locator('#${cssEscape(element.id)}')`, strategy: "stable CSS selector" };
  return { locator: `page.locator('${element.tag}[data-testid="${suggestTestId(element, category)}"]')`, strategy: "stable CSS selector" };
}

async function createFinalSummary(): Promise<void> {
  const captures = await readCaptureSummaries();
  const allElements = captures.flatMap((capture) => capture.elements);
  const idCounts = countValues(allElements.map((element) => element.id).filter(isPresent));
  const testIdCounts = countValues(allElements.map((element) => element.dataTestId).filter(isPresent));
  const analyses = allElements.map((element) => analyzeElement(element, idCounts, testIdCounts));
  const grouped = groupAnalyses(analyses);
  const lines: string[] = [];

  await fs.mkdir(path.dirname(SUMMARY_FILE), { recursive: true });
  lines.push("# D2D Frontend UI Audit Improvements");
  lines.push("");
  lines.push("## Audited Routes And Manual States");
  lines.push("");
  if (captures.length === 0) {
    lines.push("- No captures found.");
  } else {
    for (const capture of captures) {
      lines.push(`- ${capture.area} / ${capture.page} / ${capture.state}: ${capture.totalInteractiveElements} interactive elements`);
    }
  }
  lines.push("");
  lines.push(`Total interactive elements: ${allElements.length}`);
  lines.push("");
  lines.push("## Repeated Issues By Component Type");
  lines.push("");
  appendTopGroups(lines, grouped, "all");
  lines.push("");
  appendPrioritySection(lines, "High-priority frontend improvements", grouped, "High");
  appendPrioritySection(lines, "Medium-priority frontend improvements", grouped, "Medium");
  appendPrioritySection(lines, "Low-priority frontend improvements", grouped, "Low");
  lines.push("");
  lines.push("## Data-testid Naming Convention");
  lines.push("");
  lines.push("- Use lowercase kebab-case: `d2d-<area>-<page>-<component>-<element>[-<action>]`.");
  lines.push("- Prefer `getByRole()`, `getByLabel()`, `getByText()`, and `getByPlaceholder()` before `getByTestId()`.");
  lines.push("- Use shared test IDs for repeated collection actions only when tests can scope to a row, card, or option.");
  lines.push("- Add stable business attributes for repeated records, for example `data-object-id`, `data-team-id`, or `data-organization-id`.");
  lines.push("- Do not include generated IDs, customer names, tokens, environment names, or row indexes in test IDs.");
  lines.push("");
  lines.push("## Representative HTML Examples");
  lines.push("");
  appendRepresentativeExamples(lines, allElements);
  lines.push("## Technical Task");
  lines.push("");
  lines.push("Improve D2D frontend semantics and locator stability across audited routes by replacing generic interactive elements with native controls where practical, adding accessible names and labels, exposing ARIA state for custom components, resolving duplicate IDs, and adding scoped stable test IDs only where user-facing locators are insufficient.");
  lines.push("");
  lines.push("## Acceptance Criteria");
  lines.push("");
  lines.push("- Core controls can be located with role, label, text, or placeholder based Playwright locators.");
  lines.push("- Icon-only controls have meaningful accessible names and decorative icons use `aria-hidden=\"true\"`.");
  lines.push("- Form controls have visible labels or equivalent accessible names.");
  lines.push("- Dropdowns and tabs expose stable roles, names, and state attributes.");
  lines.push("- Repeated rows/cards/options expose stable business attributes for scoping row actions.");
  lines.push("- No core test requires XPath or long generated-class selectors.");
  lines.push("- Duplicate HTML IDs are removed or replaced with stable unique IDs where ARIA or label relationships need them.");
  lines.push("");
  lines.push("Raw DOM files remain local and must never be committed.");
  lines.push("Hidden states require manual opening before `capture-current` can inspect them.");
  lines.push("");

  await fs.writeFile(SUMMARY_FILE, `${lines.join("\n")}\n`, "utf8");
}

async function readCaptureSummaries(): Promise<CaptureSummary[]> {
  const captures: CaptureSummary[] = [];
  const areas = await readDirs(PAGES_ROOT);
  for (const area of areas) {
    const pages = await readDirs(path.join(PAGES_ROOT, area.name));
    for (const pageDir of pages) {
      const states = await readDirs(path.join(PAGES_ROOT, area.name, pageDir.name));
      for (const state of states) {
        const base = path.join(PAGES_ROOT, area.name, pageDir.name, state.name);
        try {
          const interactive = normalizeInteractiveExtraction(
            JSON.parse(await fs.readFile(path.join(base, "interactive-elements.json"), "utf8")),
          );
          const accessibility = JSON.parse(await fs.readFile(path.join(base, "accessibility-report.json"), "utf8")) as AxeResult;
          captures.push({
            area: area.name,
            page: pageDir.name,
            state: state.name,
            totalInteractiveElements: interactive.elements.length,
            elements: interactive.elements,
            violations: accessibility.violations ?? [],
          });
        } catch {
          // Ignore incomplete capture folders.
        }
      }
    }
  }
  return captures.sort((a, b) => `${a.area}/${a.page}/${a.state}`.localeCompare(`${b.area}/${b.page}/${b.state}`));
}

async function readDirs(directory: string): Promise<import("node:fs").Dirent[]> {
  try {
    return (await fs.readdir(directory, { withFileTypes: true })).filter((entry) => entry.isDirectory());
  } catch {
    return [];
  }
}

function normalizeInteractiveExtraction(value: unknown): InteractiveExtraction {
  if (Array.isArray(value)) {
    return { elements: value.map(normalizeElement), shadowRoots: [], iframes: [] };
  }
  if (!isRecord(value)) return { elements: [], shadowRoots: [], iframes: [] };
  const elements = Array.isArray(value.elements) ? value.elements.map(normalizeElement) : [];
  const shadowRoots = Array.isArray(value.shadowRoots) ? value.shadowRoots.filter(isRecord) : [];
  const iframes = Array.isArray(value.iframes) ? value.iframes.filter(isRecord) : [];
  return { elements, shadowRoots, iframes };
}

function normalizeElement(value: unknown, fallbackIndex = 0): InteractiveElement {
  const raw = isRecord(value) ? value : {};
  return {
    index: typeof raw.index === "number" ? raw.index : fallbackIndex,
    tag: asString(raw.tag, "unknown").toLowerCase(),
    type: nullableString(raw.type),
    visibleText: nullableString(raw.visibleText),
    role: nullableString(raw.role),
    accessibleName: nullableString(raw.accessibleName),
    id: nullableString(raw.id),
    name: nullableString(raw.name),
    placeholder: nullableString(raw.placeholder),
    title: nullableString(raw.title),
    classList: Array.isArray(raw.classList) ? raw.classList.map(String) : [],
    ariaLabel: nullableString(raw.ariaLabel),
    ariaLabelledBy: nullableString(raw.ariaLabelledBy),
    ariaDescribedBy: nullableString(raw.ariaDescribedBy),
    ariaExpanded: nullableString(raw.ariaExpanded),
    ariaSelected: nullableString(raw.ariaSelected),
    ariaChecked: nullableString(raw.ariaChecked),
    ariaControls: nullableString(raw.ariaControls),
    dataTestId: nullableString(raw.dataTestId),
    dataAttributes: isRecord(raw.dataAttributes)
      ? Object.fromEntries(Object.entries(raw.dataAttributes).map(([key, item]) => [key, String(item)]))
      : {},
    disabled: Boolean(raw.disabled),
    appearsDisabled: Boolean(raw.appearsDisabled ?? raw.disabled),
    readOnly: Boolean(raw.readOnly),
    hrefPresent: Boolean(raw.hrefPresent),
    hrefSanitized: nullableString(raw.hrefSanitized),
    associatedLabelText: nullableString(raw.associatedLabelText),
    visible: Boolean(raw.visible ?? true),
    diagnosticDomPath: asString(raw.diagnosticDomPath, ""),
    htmlSnippet: asString(raw.htmlSnippet, "<!-- snippet unavailable -->"),
  };
}

function appendIssueGroup(
  lines: string[],
  title: string,
  groups: Array<{ issueKey: string; category: string; issue: string; priority: Priority; count: number }>,
  issueKey: string,
): void {
  lines.push(`### ${title}`);
  lines.push("");
  const matches = groups.filter((group) => group.issueKey === issueKey);
  if (matches.length === 0) {
    lines.push("- None detected.");
  } else {
    for (const group of matches.slice(0, 10)) {
      lines.push(`- ${group.category}: ${group.issue} Count: ${group.count}; priority: ${group.priority}`);
    }
  }
  lines.push("");
}

function appendTopGroups(
  lines: string[],
  groups: Array<{ issueKey: string; category: string; issue: string; priority: Priority; count: number }>,
  priority: Priority | "all",
): void {
  const selected = groups.filter((group) => priority === "all" || group.priority === priority);
  if (selected.length === 0) {
    lines.push("- None detected.");
    return;
  }
  for (const group of selected.slice(0, 16)) {
    lines.push(`- ${group.category}: ${group.issue} Count: ${group.count}; priority: ${group.priority}`);
  }
}

function appendPrioritySection(
  lines: string[],
  title: string,
  groups: Array<{ issueKey: string; category: string; issue: string; priority: Priority; count: number }>,
  priority: Priority,
): void {
  lines.push(`## ${title}`);
  lines.push("");
  appendTopGroups(lines, groups, priority);
  lines.push("");
}

function appendRepresentativeExamples(lines: string[], elements: InteractiveElement[]): void {
  const idCounts = countValues(elements.map((element) => element.id).filter(isPresent));
  const testIdCounts = countValues(elements.map((element) => element.dataTestId).filter(isPresent));
  const categories = [
    "standard button",
    "icon-only button",
    "search field",
    "dropdown trigger",
    "dropdown option",
    "tab",
    "table row",
    "row action button",
  ];

  for (const category of categories) {
    const element = elements.find((candidate) => getCategory(candidate) === category);
    const fallback = fallbackExample(category);
    const analysis = element ? analyzeElement(element, idCounts, testIdCounts) : null;
    lines.push(`### ${titleCase(category)}`);
    lines.push("");
    lines.push("Current:");
    lines.push("");
    lines.push("```html");
    lines.push(element?.htmlSnippet ?? fallback.current);
    lines.push("```");
    lines.push("");
    lines.push("Improved:");
    lines.push("");
    lines.push("```html");
    lines.push(analysis?.recommendedHtml ?? fallback.improved);
    lines.push("```");
    lines.push("");
  }
}

function fallbackExample(category: string): { current: string; improved: string } {
  switch (category) {
    case "standard button":
      return { current: '<div role="button">Submit</div>', improved: '<button type="button">Submit</button>' };
    case "icon-only button":
      return {
        current: '<button class="icon-search"></button>',
        improved: '<button type="button" aria-label="Search"><span class="icon-search" aria-hidden="true"></span></button>',
      };
    case "search field":
      return {
        current: '<input type="text" />',
        improved: '<label for="object-search">Search objects</label>\n<input id="object-search" type="search" />',
      };
    case "dropdown trigger":
      return {
        current: '<div role="button" class="select-value">10</div>',
        improved: '<button type="button" aria-expanded="false" aria-controls="page-size-options">10</button>',
      };
    case "dropdown option":
      return { current: '<div role="menuitem" class="option">10</div>', improved: '<button type="button" role="option">10</button>' };
    case "tab":
      return {
        current: '<div role="tab" aria-selected="true">Info</div>',
        improved: '<button type="button" role="tab" aria-selected="true" aria-controls="info-panel">Info</button>',
      };
    case "table row":
      return {
        current: '<tr class="generated-row"><td>Record summary</td></tr>',
        improved: '<tr data-object-id="{stable-business-id}"><td>Record summary</td></tr>',
      };
    default:
      return {
        current: '<div role="button" class="icon-action"></div>',
        improved:
          '<button type="button" aria-label="Open row details" data-testid="d2d-objects-list-row-action-open-details"><span class="icon" aria-hidden="true"></span></button>',
      };
  }
}

function groupAnalyses(
  analyses: Array<ElementAnalysis & { issueKey: string; category: string }>,
): Array<{ issueKey: string; category: string; issue: string; priority: Priority; count: number }> {
  const groups = new Map<string, { issueKey: string; category: string; issue: string; priority: Priority; count: number }>();
  for (const analysis of analyses) {
    if (analysis.issueKey === "none") continue;
    const key = `${analysis.issueKey}|${analysis.category}|${analysis.issue}|${analysis.priority}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groups.set(key, {
        issueKey: analysis.issueKey,
        category: analysis.category,
        issue: analysis.issue,
        priority: analysis.priority,
        count: 1,
      });
    }
  }
  return Array.from(groups.values()).sort((a, b) => b.count - a.count || a.priority.localeCompare(b.priority));
}

function countValues(values: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function suggestTestId(element: InteractiveElement, category: string): string {
  if (element.dataTestId) return element.dataTestId;
  const categoryPart = category.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `d2d-page-${categoryPart}`;
}

function stableId(value: string | null): value is string {
  return Boolean(value && !/[0-9]{4,}$/.test(value) && value.length < 80);
}

function firstPresent(...values: Array<string | null | undefined>): string | null {
  for (const value of values) {
    const clean = value?.trim();
    if (clean) return clean;
  }
  return null;
}

function isPresent(value: string | null | undefined): value is string {
  return Boolean(value);
}

function stringField(value: Record<string, unknown>, key: string): string {
  const field = value[key];
  if (typeof field !== "string" || !field.trim()) throw new Error(`Route field "${key}" must be a non-empty string.`);
  return field.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function nullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim();
  return clean ? clean : null;
}

function isSafeSlug(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(value) && !value.includes("..");
}

function sanitizeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]")
    .replace(/https?:\/\/\S+/gi, "[REDACTED_URL]");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function quote(value: string): string {
  return JSON.stringify(value);
}

function regex(value: string): string {
  return `/${value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/i`;
}

function cssEscape(value: string): string {
  return value.replace(/(["'\\.#:[\]>+~*^$|= ])/g, "\\$1");
}

function markdownCell(value: string): string {
  const clean = value
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED]")
    .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, "[REDACTED]")
    .replace(/\b\d{5,}\b/g, "[REDACTED]")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 180);
  return (clean || "none").replace(/\|/g, "\\|");
}

async function createDropdownRunRoot(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const baseRoot = path.join(AUDIT_ROOT, "dropdown-audit-runs", timestamp);
  let candidate = baseRoot;
  let suffix = 2;
  while (await pathExists(candidate)) {
    candidate = `${baseRoot}-${suffix}`;
    suffix += 1;
  }
  await fs.mkdir(candidate, { recursive: true });
  return candidate;
}

async function createPredefinedFilterRunRoot(): Promise<string> {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "").replace(/:/g, "-");
  const baseRoot = path.join(AUDIT_ROOT, "predefined-filter-audit-runs", timestamp);
  let candidate = baseRoot;
  let suffix = 2;
  while (await pathExists(candidate)) {
    candidate = `${baseRoot}-${suffix}`;
    suffix += 1;
  }
  await fs.mkdir(candidate, { recursive: true });
  return candidate;
}

async function evaluateBrowserScript<T>(page: Page, script: string, arg?: unknown): Promise<T> {
  const payload = arg === undefined ? "" : JSON.stringify(arg).replace(/</g, "\\u003c");
  return page.evaluate<T>(`(${script})(${payload})`);
}

function sanitizeHtmlFragment(value: string): string {
  return value
    .replace(/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, "[REDACTED]")
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi, "$1 [REDACTED]")
    .replace(/\b(access[_-]?token|refresh[_-]?token|id[_-]?token|authorization|cookie|session|password|secret|client_secret)=([^&\s\"'<>]+)/gi, "$1=[REDACTED]")
    .replace(/\b(value|data-value)=(["'])(.*?)\2/gi, "$1=$2[REDACTED]$2")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[REDACTED]")
    .replace(/\b(?:\+?\d[\d ()./-]{6,}\d)\b/g, "[REDACTED]")
    .replace(/\b\d{5,}\b/g, "[REDACTED]");
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function isAuthenticationLikelyExpired(page: Page): Promise<boolean> {
  try {
    return await page.evaluate(() => {
      const text = `${document.title} ${document.body?.innerText ?? ""}`.toLowerCase();
      return (
        text.includes("login") ||
        text.includes("sign in") ||
        text.includes("session expired") ||
        text.includes("authenticate") ||
        text.includes("anmelden")
      );
    });
  } catch {
    return false;
  }
}

function describeDropdownCandidate(candidate: DropdownCandidate): string {
  const parts = [
    `label=${candidate.label || "none"}`,
    `accessibleName=${candidate.accessibleName || "none"}`,
    `tag=${candidate.tag}`,
    `role=${candidate.role ?? "none"}`,
    `id=${candidate.id ?? "none"}`,
    `data-testid=${candidate.dataTestId ?? "none"}`,
  ];
  return parts.join("; ");
}

function dropdownPriority(candidate: DropdownCandidate, options: DropdownOptionInfo[]): Priority {
  if (!firstPresent(candidate.label, candidate.accessibleName, candidate.ariaLabel)) {
    return "High";
  }
  if (candidate.kind !== "native select" && !candidate.ariaExpanded) {
    return "High";
  }
  if (options.some((option) => !option.role && option.tag !== "option")) {
    return "Medium";
  }
  if (candidate.kind !== "native select" && !candidate.ariaControls) {
    return "Medium";
  }
  return "Low";
}

function dropdownIssue(candidate: DropdownCandidate, options: DropdownOptionInfo[]): string {
  if (!firstPresent(candidate.label, candidate.accessibleName, candidate.ariaLabel)) {
    return "Dropdown trigger lacks a meaningful accessible name.";
  }
  if (candidate.kind !== "native select" && !candidate.ariaExpanded) {
    return "Custom dropdown trigger does not expose aria-expanded.";
  }
  if (candidate.kind !== "native select" && !candidate.ariaControls) {
    return "Custom dropdown trigger should expose aria-controls when it owns a popup/list.";
  }
  if (options.some((option) => !option.role && option.tag !== "option")) {
    return "Selectable options should expose role=\"option\" or menuitem semantics.";
  }
  return "No high-risk dropdown issue detected.";
}

function dropdownMissingAttributes(candidate: DropdownCandidate, options: DropdownOptionInfo[]): string[] {
  const missing: string[] = [];
  if (!firstPresent(candidate.label, candidate.accessibleName, candidate.ariaLabel)) {
    missing.push("Trigger needs a meaningful accessible name from visible text, label, aria-label, or aria-labelledby.");
  }
  if (candidate.kind !== "native select" && !candidate.ariaExpanded) {
    missing.push("Custom trigger should expose aria-expanded and update it on open/close.");
  }
  if (candidate.kind !== "native select" && !candidate.ariaControls) {
    missing.push("Custom trigger should expose aria-controls when a popup/list is controlled by the trigger.");
  }
  if (candidate.kind === "combobox" && candidate.role !== "combobox") {
    missing.push("Combobox-like trigger should expose role=\"combobox\" where appropriate.");
  }
  const rolelessOptions = options.filter((option) => !option.role && option.tag !== "option").length;
  if (rolelessOptions > 0) {
    missing.push(`${rolelessOptions} visible option-like elements are missing role=\"option\" or menuitem semantics.`);
  }
  const statelessOptions = options.filter((option) => !option.ariaSelected && !option.ariaChecked).length;
  if (statelessOptions > 0 && options.length > 1) {
    missing.push("Options should expose aria-selected or aria-checked when selection state is meaningful.");
  }
  if (missing.length === 0) {
    missing.push("No missing dropdown-specific semantic attributes detected from this capture.");
  }
  return missing;
}

function recommendedDropdownHtml(candidate: DropdownCandidate, options: DropdownOptionInfo[]): string {
  const name = escapeHtml(firstPresent(candidate.label, candidate.accessibleName, candidate.ariaLabel) ?? "Filter");
  const listId = stableId(candidate.ariaControls) ? candidate.ariaControls : "filter-options";
  const testId = candidate.dataTestId ? ` data-testid="${escapeHtml(candidate.dataTestId)}"` : "";

  if (candidate.kind === "native select") {
    return `<label for="filter-select">${name}</label>\n<select id="filter-select"${testId}>\n  <option>Option label</option>\n</select>`;
  }

  const optionHtml = options[0]
    ? `<li role="option" aria-selected="${escapeHtml(options[0].ariaSelected ?? "false")}">${escapeHtml(options[0].text || "Option label")}</li>`
    : `<li role="option" aria-selected="false">Option label</li>`;

  return `<button type="button" aria-haspopup="listbox" aria-expanded="false" aria-controls="${escapeHtml(
    listId ?? "filter-options",
  )}"${testId}>${name}</button>\n<ul id="${escapeHtml(listId ?? "filter-options")}" role="listbox">\n  ${optionHtml}\n</ul>`;
}

function recommendedDropdownLocator(candidate: DropdownCandidate): string {
  const name = firstPresent(candidate.label, candidate.accessibleName, candidate.ariaLabel);
  if (candidate.kind === "native select" && name) {
    return `page.getByLabel(${quote(name)})`;
  }
  if (candidate.role && name) {
    return `page.getByRole('${candidate.role}', { name: ${regex(name)} })`;
  }
  if (name) {
    const role = candidate.kind === "combobox" ? "combobox" : "button";
    return `page.getByRole('${role}', { name: ${regex(name)} })`;
  }
  if (candidate.dataTestId) {
    return `page.getByTestId(${quote(candidate.dataTestId)})`;
  }
  if (stableId(candidate.id)) {
    return `page.locator('#${cssEscape(candidate.id)}')`;
  }
  return "Use a scoped getByTestId() after adding a stable dropdown trigger test id.";
}

function currentDropdownSnippet(candidate: DropdownCandidate): string {
  const attributes = [
    candidate.id ? `id="${escapeHtml(candidate.id)}"` : "",
    candidate.role ? `role="${escapeHtml(candidate.role)}"` : "",
    candidate.dataTestId ? `data-testid="${escapeHtml(candidate.dataTestId)}"` : "",
    candidate.ariaLabel ? `aria-label="${escapeHtml(candidate.ariaLabel)}"` : "",
    candidate.ariaHasPopup ? `aria-haspopup="${escapeHtml(candidate.ariaHasPopup)}"` : "",
    candidate.ariaExpanded ? `aria-expanded="${escapeHtml(candidate.ariaExpanded)}"` : "",
    candidate.ariaControls ? `aria-controls="${escapeHtml(candidate.ariaControls)}"` : "",
    candidate.classList.length ? `class="${escapeHtml(candidate.classList.join(" "))}"` : "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<${candidate.tag}${attributes ? ` ${attributes}` : ""}>${escapeHtml(candidate.label || "")}</${candidate.tag}>`;
}

function groupDropdownCaptures(
  captures: DropdownCaptureRecord[],
): Array<{ issue: string; priority: Priority; count: number }> {
  const groups = new Map<string, { issue: string; priority: Priority; count: number }>();
  for (const capture of captures) {
    const key = `${capture.issue}|${capture.priority}`;
    const existing = groups.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groups.set(key, { issue: capture.issue, priority: capture.priority, count: 1 });
    }
  }
  return Array.from(groups.values()).sort((a, b) => b.count - a.count || a.priority.localeCompare(b.priority));
}

function appendDropdownPriority(lines: string[], captures: DropdownCaptureRecord[], priority: Priority): void {
  lines.push(`## ${priority}-Priority Improvements`);
  lines.push("");
  const matching = captures.filter((capture) => capture.priority === priority);
  if (matching.length === 0) {
    lines.push("- None detected.");
  } else {
    for (const capture of matching.slice(0, 20)) {
      lines.push(`- ${capture.route.area} / ${capture.route.page} / ${capture.folderName}: ${capture.issue}`);
    }
  }
  lines.push("");
}

function sum(
  stats: DropdownRouteStats[],
  key:
    | "detectedDropdowns"
    | "openedDropdowns"
    | "nativeSelects"
    | "skippedDropdowns"
    | "hardExcludedOverlayOpeners",
): number {
  return stats.reduce((total, item) => total + item[key], 0);
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/\[redacted\]/g, "redacted")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return slug || "dropdown";
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function printHelp(): void {
  console.log("Commands:");
  console.log("  capture-current <area> <page> <state>");
  console.log("  help");
  console.log("  finish");
  console.log("");
  console.log("Example:");
  console.log("  capture-current objects neubau-list all-filters-expanded");
  console.log("");
}

main().catch((error: unknown) => {
  console.error(`UI audit utility failed: ${sanitizeError(error)}`);
  process.exitCode = 1;
});
