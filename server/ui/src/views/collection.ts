import { chip, empty, fmtNumber, h, icon, jsonBlock, section, tiles } from "../dom.js";
import type { CollectionResultT, ViewContext } from "../context.js";

export function collectionView(data: CollectionResultT, ctx: ViewContext): HTMLElement {
  const v = data.vector;
  const body = h("div", { class: "stack" },
    tiles([
      ["Documents", fmtNumber(data.estimatedCount, true), "Estimated count"],
      ["Dimension", v?.dimension ? String(v.dimension) : "—"],
      ["Metric", v?.metric ?? "—"],
      ["Default id", data.defaultIdType ?? "—"],
    ]),
    h("div", { class: "chips" },
      v ? (v.model ? chip(`vectorize · ${v.provider}/${v.model}`, "accent") : chip("vector (bring your own embeddings)", "accent")) : chip("no vector search"),
      data.lexical.enabled ? chip("lexical (BM25)", "good") : null,
      data.rerank.enabled ? chip(`rerank · ${data.rerank.provider ?? ""}/${data.rerank.model ?? ""}`, "good") : null,
      data.indexing.deny ? chip(`not indexed: ${data.indexing.deny.join(", ")}`, "warn") : null,
      data.indexing.allow ? chip(`indexed only: ${data.indexing.allow.join(", ")}`, "warn") : null,
    ),
  );

  if (ctx.canCall) {
    const actions = h("div", { class: "actions" },
      h("button", {
        class: "btn",
        type: "button",
        onclick: () => ctx.call("find", { name: data.name, keyspace: data.keyspace, kind: "collection" }, { label: `documents of ${data.name}` }),
      }, icon("list"), "Browse documents"),
    );
    if (v?.model) {
      const input = h("input", { class: "input", type: "search", placeholder: `Search ${data.name} by meaning…`, "aria-label": "Semantic search query" });
      const hybridBox = data.lexical.enabled && data.rerank.enabled
        ? h("label", { class: "check" }, h("input", { type: "checkbox" }), "Hybrid")
        : null;
      const run = () => {
        const query = input.value.trim();
        if (!query) return input.focus();
        const hybrid = Boolean(hybridBox?.querySelector("input")?.checked);
        void ctx.call("vector_search", { name: data.name, keyspace: data.keyspace, kind: "collection", query, hybrid }, { label: `search "${query}" in ${data.name}` });
      };
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") run();
      });
      actions.append(h("form", { class: "search", onsubmit: (e: Event) => { e.preventDefault(); run(); } },
        input, hybridBox, h("button", { class: "btn primary", type: "submit" }, icon("search"), "Search")));
    }
    body.append(actions);
  }

  body.append(section("Fields (from a sample document)",
    data.fields.length
      ? h("div", { class: "fields" }, data.fields.map((f) => h("span", { class: "field" }, h("b", null, f.name), h("i", null, f.type))))
      : empty("No documents yet.")));
  if (data.sampleDocument) body.append(jsonBlock(data.sampleDocument, "Sample document"));
  return body;
}
