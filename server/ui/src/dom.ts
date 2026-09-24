/** Tiny DOM helpers and formatters (no framework; the whole UI inlines into one HTML resource). */

type Child = Node | string | number | null | undefined | false | Child[];
type Props = Record<string, unknown> | null | undefined;

function append(parent: Node, child: Child): void {
  if (child === null || child === undefined || child === false) return;
  if (Array.isArray(child)) {
    for (const c of child) append(parent, c);
    return;
  }
  parent.appendChild(child instanceof Node ? child : document.createTextNode(String(child)));
}

function applyProps(el: Element, props: Props): void {
  for (const [key, value] of Object.entries(props ?? {})) {
    if (value === undefined || value === null || value === false) continue;
    if (key === "class") el.setAttribute("class", String(value));
    else if (key === "style" && typeof value === "object") Object.assign((el as HTMLElement).style, value);
    else if (key.startsWith("on") && typeof value === "function") el.addEventListener(key.slice(2).toLowerCase(), value as EventListener);
    else if (value === true) el.setAttribute(key, "");
    else el.setAttribute(key, String(value));
  }
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props?: Props, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  applyProps(el, props);
  append(el, children);
  return el;
}

const SVG_NS = "http://www.w3.org/2000/svg";

export function s(tag: string, props?: Props, ...children: Child[]): SVGElement {
  const el = document.createElementNS(SVG_NS, tag);
  applyProps(el, props);
  append(el, children);
  return el;
}

export const fmtNumber = (n: number | null | undefined, approx = false): string =>
  n === null || n === undefined ? "—" : `${approx ? "~" : ""}${n.toLocaleString()}`;

export const fmtScore = (n: number | null | undefined): string => (n === null || n === undefined ? "—" : n.toFixed(3));

export function preview(value: unknown, max = 120): string {
  if (value === null || value === undefined) return "—";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
}

export function typeOf(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  if (typeof value === "object") {
    const keys = Object.keys(value as object);
    if (keys.length === 1 && keys[0].startsWith("$")) return keys[0].slice(1);
    return "object";
  }
  return typeof value;
}

/** Keyboard + mouse activation for a non-button element acting as a button. */
export function activatable<T extends HTMLElement>(el: T, onActivate: () => void, label?: string): T {
  el.tabIndex = 0;
  el.setAttribute("role", "button");
  if (label) el.setAttribute("aria-label", label);
  el.addEventListener("click", onActivate);
  el.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onActivate();
    }
  });
  return el;
}

export function icon(name: "back" | "expand" | "search" | "db" | "table" | "collection" | "spark" | "list" | "map" | "alert" | "arrow"): SVGElement {
  const paths: Record<string, string> = {
    back: "M15 18l-6-6 6-6",
    expand: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7",
    search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16zM21 21l-4.35-4.35",
    db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    table: "M3 5h18v14H3zM3 10h18M9 10v9",
    collection: "M8 4h10a2 2 0 0 1 2 2v12M4 8h10a2 2 0 0 1 2 2v10H6a2 2 0 0 1-2-2z",
    spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6",
    list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
    map: "M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 12m-4 0a4 4 0 1 0 8 0 4 4 0 1 0-8 0",
    alert: "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    arrow: "M9 18l6-6-6-6",
  };
  return s("svg", { viewBox: "0 0 24 24", class: "icon", "aria-hidden": "true" },
    s("path", { d: paths[name], fill: "none", stroke: "currentColor", "stroke-width": "2", "stroke-linecap": "round", "stroke-linejoin": "round" }));
}

export function tiles(items: [label: string, value: string, hint?: string][]): HTMLElement {
  return h("dl", { class: "tiles" }, items.map(([label, value, hint]) =>
    h("div", { class: "tile" }, h("dt", null, label), h("dd", { title: hint }, value))));
}

export function chip(text: string, tone: "accent" | "neutral" | "good" | "warn" = "neutral", title?: string): HTMLElement {
  return h("span", { class: `chip ${tone}`, title }, text);
}

export function section(title: string, ...children: Child[]): HTMLElement {
  return h("section", { class: "section" }, h("h2", null, title), ...children);
}

export function jsonBlock(value: unknown, summary = "JSON", open = false): HTMLElement {
  return h("details", { class: "json", open },
    h("summary", null, summary),
    h("pre", null, h("code", null, JSON.stringify(value, null, 2))));
}

export function empty(text: string): HTMLElement {
  return h("p", { class: "empty" }, text);
}
