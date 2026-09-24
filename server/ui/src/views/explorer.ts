import { activatable, chip, empty, h, icon, jsonBlock, preview, typeOf } from "../dom.js";
import type { ExplorerResultT, ViewContext } from "../context.js";

const MAX_COLS = 4;

function scalar(value: unknown): value is string | number | boolean {
  return ["string", "number", "boolean"].includes(typeof value);
}

export function explorerView(data: ExplorerResultT, ctx: ViewContext): HTMLElement {
  const noun = data.kind === "table" ? "row" : "document";
  const cols = [...(data.kind === "collection" ? ["_id"] : []), ...data.displayFields.filter((f) => f !== "_id")].slice(0, MAX_COLS);
  const body = h("div", { class: "stack" });

  const filterBar = h("div", { class: "chips" },
    chip(`${data.documents.length} ${noun}${data.documents.length === 1 ? "" : "s"}${data.nextPageState ? "+" : ""}`, "accent"),
    data.filter ? chip(`filter ${preview(data.filter, 80)}`, "warn") : null,
    data.sort ? chip(`sort ${preview(data.sort, 60)}`) : null,
    data.filter && ctx.canCall
      ? h("button", { class: "link", type: "button", onclick: () => ctx.call("find", { name: data.name, keyspace: data.keyspace, kind: data.kind }, { label: `all of ${data.name}` }) }, "Clear filter")
      : null,
  );
  body.append(filterBar);

  if (data.fields.length) {
    body.append(h("div", { class: "fields" }, data.fields.slice(0, 24).map((f) =>
      h("span", { class: "field", title: `${f.present} of ${data.documents.length}` }, h("b", null, f.name), h("i", null, f.type)))));
  }

  if (!data.documents.length) {
    body.append(empty(data.filter ? `No ${noun}s match this filter.` : `No ${noun}s yet.`));
    return body;
  }

  const tbody = h("tbody");
  for (const doc of data.documents) {
    const detail = h("tr", { class: "detail", hidden: true },
      h("td", { colspan: String(cols.length) }, detailPanel(doc, data, ctx)));
    const row = h("tr", { class: "clickable", "aria-expanded": "false" },
      cols.map((c) => h("td", null, c === "_id" ? h("code", null, preview(doc[c], 40)) : preview(doc[c], 80))));
    activatable(row, () => {
      const open = detail.hidden;
      detail.hidden = !open;
      row.setAttribute("aria-expanded", String(open));
    }, `Show ${noun} details`);
    tbody.append(row, detail);
  }
  body.append(h("div", { class: "scroll" }, h("table", { class: "grid" },
    h("thead", null, h("tr", null, cols.map((c) => h("th", { scope: "col" }, c)))),
    tbody)));

  if (data.nextPageState && ctx.canCall) {
    body.append(h("div", { class: "actions center" }, h("button", {
      class: "btn", type: "button",
      onclick: () => ctx.call("find", {
        name: data.name, keyspace: data.keyspace, kind: data.kind,
        ...(data.filter ? { filter: data.filter } : {}),
        ...(data.sort ? { sort: data.sort } : {}),
        pageState: data.nextPageState,
      }, { mode: "merge", label: `more of ${data.name}` }),
    }, "Load more")));
  }
  return body;
}

function detailPanel(doc: Record<string, unknown>, data: ExplorerResultT, ctx: ViewContext): HTMLElement {
  const panel = h("div", { class: "detail-panel" });
  if (ctx.canCall) {
    const actions = h("div", { class: "actions" });
    if (data.kind === "collection" && doc._id !== undefined) {
      actions.append(h("button", {
        class: "btn small", type: "button",
        onclick: () => ctx.call("vector_search", { name: data.name, keyspace: data.keyspace, kind: "collection", documentId: doc._id }, { label: `documents similar to ${preview(doc._id, 40)}` }),
      }, icon("spark"), "More like this"));
    }
    const filterables = Object.entries(doc).filter(([k, v]) => k !== "_id" && !k.startsWith("$") && scalar(v)).slice(0, 4);
    for (const [key, value] of filterables) {
      actions.append(h("button", {
        class: "btn small ghost", type: "button", title: `Filter ${key} = ${String(value)}`,
        onclick: () => ctx.call("find", { name: data.name, keyspace: data.keyspace, kind: data.kind, filter: { [key]: value } }, { label: `${data.name} where ${key} = ${String(value)}` }),
      }, `${key} = ${preview(value, 24)}`));
    }
    if (actions.childNodes.length) panel.append(actions);
  }
  panel.append(jsonBlock(doc, `${typeOf(doc._id) === "undefined" ? "Row" : "Document"} JSON`, true));
  return panel;
}
