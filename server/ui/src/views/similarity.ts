import { activatable, empty, fmtScore, h, icon, jsonBlock, preview, s, tiles } from "../dom.js";
import type { SimilarityResultT, ViewContext } from "../context.js";

type Hit = SimilarityResultT["hits"][number];

function normalized(hits: Hit[]): (hit: Hit) => number {
  const scores = hits.map((x) => x.similarity).filter((x): x is number => x !== null);
  const max = Math.max(...scores, 0);
  const min = Math.min(...scores, max);
  const span = max - min || 1;
  // Keep a visible floor so the weakest hit still shows a bar.
  return (hit) => (hit.similarity === null ? 0.08 : 0.15 + 0.85 * ((hit.similarity - min) / span));
}

export function similarityView(data: SimilarityResultT, ctx: ViewContext): HTMLElement {
  const body = h("div", { class: "stack" });
  body.append(tiles([
    ["Hits", String(data.hits.length)],
    ["Best", fmtScore(data.stats.max)],
    ["Mean", fmtScore(data.stats.mean)],
    ["Lowest", fmtScore(data.stats.min)],
  ]));
  for (const warning of data.warnings) body.append(h("p", { class: "banner warn" }, icon("alert"), warning));
  if (!data.hits.length) {
    body.append(empty("No matches."));
    return body;
  }

  const norm = normalized(data.hits);
  const detail = h("div", { class: "hit-detail", "aria-live": "polite" });
  const select = (hit: Hit) => {
    const parts: (HTMLElement | null)[] = [
      h("div", { class: "hit-detail-head" },
        h("strong", null, `#${hit.rank} ${hit.title}`),
        h("span", { class: "score" }, fmtScore(hit.similarity))),
      ctx.canCall && data.kind === "collection"
        ? h("div", { class: "actions" }, h("button", {
          class: "btn small", type: "button",
          onclick: () => ctx.call("vector_search", { name: data.name, keyspace: data.keyspace, kind: "collection", documentId: hit.idValue ?? hit.id }, { label: `documents similar to ${hit.title}` }),
        }, icon("spark"), "More like this"))
        : null,
      jsonBlock(hit.document, "Document", true),
    ];
    detail.replaceChildren(...parts.filter((p): p is HTMLElement => p !== null));
  };

  const ranked = h("ol", { class: "hits" }, data.hits.map((hit) => {
    const item = h("li", { class: "hit" },
      h("span", { class: "rank" }, String(hit.rank)),
      h("span", { class: "hit-main" },
        h("span", { class: "hit-title" }, hit.title),
        h("span", { class: "bar", "aria-hidden": "true" }, h("span", { style: { width: `${Math.round(norm(hit) * 100)}%` } })),
        h("span", { class: "hit-fields" }, Object.entries(hit.fields).slice(1, 3).map(([k, v]) => h("span", null, h("b", null, `${k} `), preview(v, 90))))),
      h("span", { class: "score" }, fmtScore(hit.similarity)));
    return activatable(item, () => select(hit), `Hit ${hit.rank}: ${hit.title}, score ${fmtScore(hit.similarity)}`);
  }));

  const map = constellation(data.hits, norm, select);
  map.hidden = true;
  const listBtn = h("button", { class: "seg on", type: "button", "aria-pressed": "true" }, icon("list"), "Ranked");
  const mapBtn = h("button", { class: "seg", type: "button", "aria-pressed": "false" }, icon("map"), "Map");
  const show = (which: "list" | "map") => {
    ranked.hidden = which !== "list";
    map.hidden = which !== "map";
    listBtn.classList.toggle("on", which === "list");
    mapBtn.classList.toggle("on", which === "map");
    listBtn.setAttribute("aria-pressed", String(which === "list"));
    mapBtn.setAttribute("aria-pressed", String(which === "map"));
  };
  listBtn.addEventListener("click", () => show("list"));
  mapBtn.addEventListener("click", () => show("map"));

  body.append(h("div", { class: "segmented", role: "group", "aria-label": "Result layout" }, listBtn, mapBtn), ranked, map, detail);
  return body;
}

/** Radial map: the query sits at the center; distance encodes (relative) dissimilarity. */
function constellation(hits: Hit[], norm: (hit: Hit) => number, select: (hit: Hit) => void): HTMLElement {
  const size = 360;
  const c = size / 2;
  const golden = Math.PI * (3 - Math.sqrt(5));
  const pad = 130; // room for labels on either side
  const svg = s("svg", { viewBox: `${-pad} 0 ${size + 2 * pad} ${size}`, class: "constellation", role: "img", "aria-label": "Similarity map: closer to the center means more similar" },
    [0.33, 0.66, 1].map((r) => s("circle", { cx: c, cy: c, r: r * (c - 16), class: "ring" })),
    s("circle", { cx: c, cy: c, r: 6, class: "origin" }),
  );
  hits.forEach((hit, i) => {
    const distance = (1 - norm(hit)) * (c - 30) + 22;
    const angle = i * golden;
    const x = c + distance * Math.cos(angle);
    const y = c + distance * Math.sin(angle);
    svg.append(s("line", { x1: c, y1: c, x2: x, y2: y, class: "spoke" }));
    const dot = s("circle", { cx: x, cy: y, r: Math.max(4, 9 - i * 0.4), class: "star", tabindex: "0", role: "button", "aria-label": `#${hit.rank} ${hit.title} (${fmtScore(hit.similarity)})` },
      s("title", null, `#${hit.rank} ${hit.title} — ${fmtScore(hit.similarity)}`));
    dot.addEventListener("click", () => {
      svg.querySelector(".star.selected")?.classList.remove("selected");
      dot.classList.add("selected");
      select(hit);
    });
    dot.addEventListener("keydown", (e) => {
      const key = (e as KeyboardEvent).key;
      if (key === "Enter" || key === " ") {
        e.preventDefault();
        dot.dispatchEvent(new MouseEvent("click"));
      }
    });
    svg.append(dot);
    if (i < 3) {
      const right = Math.cos(angle) >= 0;
      svg.append(s("text", { x: right ? x + 12 : x - 12, y: y + 4, class: "star-label", "text-anchor": right ? "start" : "end" }, preview(hit.title, 26)));
    }
  });
  return h("div", { class: "map" }, svg);
}
