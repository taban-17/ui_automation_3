import { Page } from "playwright";
import type { PageMap, InteractiveElement } from "./schema";

const INTERACTIVE_SELECTOR = [
  "button",
  "input",
  "select",
  "textarea",
  "a[href]",
  "[role='button']",
  "[role='tab']",
  "[role='link']",
].join(",");

export async function capturePage(
  page: Page,
  router: string,
  pageId: string
): Promise<PageMap> {
  const raw = await page.evaluate((sel) => {
    function getXPath(el: Element): string {
      const parts: string[] = [];
      let cur: Element | null = el;
      while (cur && cur.nodeType === Node.ELEMENT_NODE) {
        const e = cur as Element;
        let idx = 1;
        let sib = e.previousElementSibling;
        while (sib) {
          if (sib.nodeName === e.nodeName) idx++;
          sib = sib.previousElementSibling;
        }
        parts.unshift(`${e.nodeName.toLowerCase()}[${idx}]`);
        cur = e.parentElement;
      }
      return "/" + parts.join("/");
    }

    function deriveSelector(el: Element): string {
      if (el.id) return `#${el.id}`;
      const name = el.getAttribute("name");
      if (name) return `[name='${name}']`;
      const aria = el.getAttribute("aria-label");
      if (aria) return `[aria-label='${aria}']`;
      return getXPath(el);
    }

    function classify(el: Element): InteractiveElement["kind"] | null {
      const tag = el.tagName.toLowerCase();
      const role = el.getAttribute("role");
      if (tag === "a") return "link";
      if (tag === "button" || role === "button") return "button";
      if (tag === "select") return "select";
      const type = (el as HTMLInputElement).type;
      if (type === "checkbox") return "checkbox";
      if (type === "radio") return "radio";
      return "input";
    }

    const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
      .map((h) => h.textContent?.trim() ?? "")
      .filter((t) => t.length > 0);

    const seen = new Set<Element>();
    const elements: InteractiveElement[] = [];

    for (const el of Array.from(document.querySelectorAll(sel))) {
        if (seen.has(el)) continue;
        seen.add(el);

        const kind = classify(el);
        if (!kind) continue;

        const inputEl = el as HTMLInputElement;
        const anchorEl = el as HTMLAnchorElement;
        const htmlEl = el as HTMLElement;

        // Resolve label for inputs: <label for=id> → aria-label → placeholder
        let labelText = "";
        let value: string | undefined = undefined;

        if (kind === "input") {
            value = inputEl.value;

            if (inputEl.id) {
            const lbl = document.querySelector(`label[for="${inputEl.id}"]`);
            if (lbl) labelText = (lbl.textContent ?? "").trim();
            }
            if (!labelText) {
            labelText = (el.getAttribute("aria-label") ?? "").trim();
            }
            if (!labelText) {
            labelText = (inputEl.placeholder ?? "").trim();
            }
            if (!labelText) labelText = value ?? "";
        } else {
            labelText = (htmlEl.innerText ?? htmlEl.textContent ?? "").trim().slice(0, 80);
    }

  const aria = el.getAttribute("aria-label");
  elements.push({
    kind,
    text: labelText,
    value,
    xpath: getXPath(el),
    selector: deriveSelector(el),
    inputType:
      kind === "input"
        ? ((inputEl.type as InteractiveElement["inputType"]) ?? "text")
        : undefined,
    placeholder: inputEl.placeholder || undefined,
    href: kind === "link" ? anchorEl.href : undefined,
    ariaLabel: aria ?? undefined,
  });
}
    return {
      title: document.title,
      url: location.pathname + location.search,
      headings,
      elements,
    };
  }, INTERACTIVE_SELECTOR);

  // Navigation: links whose href is same-origin and inside this router's prefix
  const navigation = raw.elements
    .filter((e): e is InteractiveElement & { href: string } => e.kind === "link" && !!e.href)
    .map((e) => {
      try {
        const u = new URL(e.href);
        return { elementText: e.text, targetUrl: u.pathname };
      } catch {
        return { elementText: e.text, targetUrl: e.href };
      }
    })
    .filter((n) => n.targetUrl.startsWith(`/${router}`));

  return {
    pageId,
    router,
    url: raw.url,
    title: raw.title,
    headings: raw.headings,
    elements: raw.elements,
    navigation,
    fields: [], // filled by annotate step
  };
}

export function slugToPageId(router: string, urlPath: string): string {
  const trimmed = urlPath.replace(/^\/+|\/+$/g, "");
  const rest = trimmed.startsWith(router)
    ? trimmed.slice(router.length).replace(/^\/+/, "")
    : trimmed;
  return rest.length === 0 ? `${router}/` : `${router}/${rest}`;
}