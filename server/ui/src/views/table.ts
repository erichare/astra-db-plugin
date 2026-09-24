import { chip, empty, h, icon, jsonBlock, section, tiles } from "../dom.js";
import type { TableResultT, ViewContext } from "../context.js";

export function tableView(data: TableResultT, ctx: ViewContext): HTMLElement {
  const body = h("div", { class: "stack" },
    tiles([
      ["Columns", String(data.columns.length)],
      ["Partition key", data.primaryKey.partitionBy.join(", ") || "—"],
      ["Indexes", String(data.indexes.length)],
      ["Vector columns", String(data.vectorColumns.length)],
    ]),
  );

  if (ctx.canCall) {
    const actions = h("div", { class: "actions" },
      h("button", {
        class: "btn", type: "button",
        onclick: () => ctx.call("find", { name: data.name, keyspace: data.keyspace, kind: "table" }, { label: `rows of ${data.name}` }),
      }, icon("list"), "Browse rows"));
    const vectorize = data.vectorColumns.find((c) => c.model);
    if (vectorize) {
      const input = h("input", { class: "input", type: "search", placeholder: `Search ${vectorize.name} by meaning…`, "aria-label": "Semantic search query" });
      const run = () => {
        const query = input.value.trim();
        if (query) void ctx.call("vector_search", { name: data.name, keyspace: data.keyspace, kind: "table", query, vectorColumn: vectorize.name }, { label: `search "${query}" in ${data.name}` });
      };
      actions.append(h("form", { class: "search", onsubmit: (e: Event) => { e.preventDefault(); run(); } },
        input, h("button", { class: "btn primary", type: "submit" }, icon("search"), "Search")));
    }
    body.append(actions);
  }

  body.append(section("Columns", h("div", { class: "scroll" }, h("table", { class: "grid" },
    h("thead", null, h("tr", null, h("th", { scope: "col" }, "Name"), h("th", { scope: "col" }, "Type"), h("th", { scope: "col" }, "Key"))),
    h("tbody", null, data.columns.map((c) => h("tr", null,
      h("td", null, h("code", null, c.name)),
      h("td", null, c.type, c.detail ? h("span", { class: "muted" }, ` ${c.detail}`) : null),
      h("td", null, c.primaryKey ? chip(c.primaryKey === "partition" ? "partition" : "clustering", c.primaryKey === "partition" ? "accent" : "neutral") : null),
    )))))));

  body.append(section("Indexes", data.indexes.length
    ? h("div", { class: "chips" }, data.indexes.map((ix) => chip(`${ix.name} · ${ix.column} (${ix.type})`)))
    : empty("No secondary indexes — only primary-key filters are efficient.")));

  if (data.sampleRows.length) body.append(jsonBlock(data.sampleRows, `Sample rows (${data.sampleRows.length})`));
  return body;
}
