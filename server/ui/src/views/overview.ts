import { activatable, chip, empty, fmtNumber, h, icon, section, tiles } from "../dom.js";
import type { OverviewResultT, ViewContext } from "../context.js";

export function overviewView(data: OverviewResultT, ctx: ViewContext): HTMLElement {
  const t = data.totals;
  const body = h("div", { class: "stack" },
    tiles([
      ["Keyspaces", fmtNumber(t.keyspaces)],
      ["Collections", fmtNumber(t.collections)],
      ["Tables", fmtNumber(t.tables)],
      ["Documents", fmtNumber(t.documents, true), "Sum of estimated collection counts"],
    ]),
  );

  for (const ks of data.keyspaces) {
    const rows: HTMLElement[] = [];
    for (const c of ks.collections) {
      const vec = c.vector
        ? `${c.vector.dimension ?? "?"}d · ${c.vector.metric ?? "?"}`
        : "no vector";
      const row = h("div", { class: "row" },
        h("span", { class: "row-icon" }, icon("collection")),
        h("span", { class: "row-main" },
          h("span", { class: "row-title" }, c.name),
          h("span", { class: "row-sub" }, vec, c.vector?.model ? ` · ${c.vector.provider}/${c.vector.model}` : "")),
        h("span", { class: "row-chips" },
          c.vector?.model ? chip("vectorize", "accent") : null,
          c.lexical ? chip("lexical") : null,
          c.rerank ? chip("rerank") : null),
        h("span", { class: "row-num", title: "Estimated documents" }, fmtNumber(c.estimatedCount, true)),
        ctx.canCall ? h("span", { class: "row-go" }, icon("arrow")) : null,
      );
      if (ctx.canCall) {
        activatable(row, () => ctx.call("describe_collection", { collection: c.name, keyspace: ks.name }, { label: `collection ${ks.name}.${c.name}` }), `Open collection ${c.name}`);
      }
      rows.push(row);
    }
    for (const tbl of ks.tables) {
      const row = h("div", { class: "row" },
        h("span", { class: "row-icon" }, icon("table")),
        h("span", { class: "row-main" },
          h("span", { class: "row-title" }, tbl.name),
          h("span", { class: "row-sub" }, `${tbl.columns} columns${tbl.vectorColumns ? ` · ${tbl.vectorColumns} vector` : ""}`)),
        h("span", { class: "row-chips" }, chip("table")),
        h("span", { class: "row-num" }, ""),
        ctx.canCall ? h("span", { class: "row-go" }, icon("arrow")) : null,
      );
      if (ctx.canCall) {
        activatable(row, () => ctx.call("describe_table", { table: tbl.name, keyspace: ks.name }, { label: `table ${ks.name}.${tbl.name}` }), `Open table ${tbl.name}`);
      }
      rows.push(row);
    }
    body.append(section(
      `${ks.name}${ks.isDefault ? " · default" : ""}`,
      ks.error ? h("p", { class: "banner danger" }, ks.error) : null,
      rows.length ? h("div", { class: "rows" }, rows) : ks.error ? null : empty("Empty keyspace."),
    ));
  }

  if (data.truncated.keyspaces || data.truncated.items) {
    body.append(h("p", { class: "note" }, "Some keyspaces or items are not shown — ask for a narrower overview."));
  }
  return body;
}
