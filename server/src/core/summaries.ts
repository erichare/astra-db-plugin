import type { CollectionCardResultT, ExploreResultT, OverviewResultT, SimilarityResultT } from "./schemas.js";

const MAX_LINES = 10;

export function overviewSummary(r: OverviewResultT): string {
  const lines = [
    `Astra DB ${r.endpointHost}: ${r.totals.keyspaces} keyspace(s), ${r.totals.collections} collection(s), ${r.totals.tables} table(s)` +
      (r.totals.documents === null ? "" : `, ~${r.totals.documents} documents`) + ".",
  ];
  for (const ks of r.keyspaces) {
    for (const c of ks.collections.slice(0, MAX_LINES)) {
      const vec = c.vector ? `${c.vector.dimension ?? "?"}d ${c.vector.metric ?? ""}${c.vector.model ? ` via ${c.vector.model}` : ""}` : "no vector";
      lines.push(`- ${ks.name}.${c.name}: ${vec}${c.rerank ? ", rerank" : ""}${c.lexical ? ", lexical" : ""}${c.estimatedCount === null ? "" : `, ~${c.estimatedCount} docs`}`);
    }
    if (ks.tables.length) lines.push(`- ${ks.name} tables: ${ks.tables.join(", ")}`);
  }
  if (r.truncated) lines.push("(truncated — raise maxCollections for more)");
  return lines.join("\n");
}

export function cardSummary(r: CollectionCardResultT): string {
  const vec = r.vector ? `${r.vector.dimension ?? "?"}d ${r.vector.metric ?? ""}${r.vector.model ? `, vectorize ${r.vector.provider}/${r.vector.model}` : ""}` : "no vector";
  const parts = [
    `Collection ${r.keyspace}.${r.name}: ${r.estimatedCount === null ? "count unknown" : `~${r.estimatedCount} documents`}; ${vec}`,
    r.rerank.enabled ? `rerank ${r.rerank.provider}/${r.rerank.model}` : "",
    r.lexical.enabled ? "lexical enabled" : "",
    r.indexing.deny ? `indexing deny ${r.indexing.deny.join(",")}` : r.indexing.allow ? `indexing allow ${r.indexing.allow.join(",")}` : "",
    r.fields.length ? `fields: ${r.fields.map((f) => f.name).join(", ")}` : "",
  ].filter(Boolean);
  return parts.join("; ") + ".";
}

export function similaritySummary(r: SimilarityResultT): string {
  const subject = r.query ? `"${r.query}"` : `document ${r.documentId}`;
  const lines = [`Top ${r.hits.length} in ${r.keyspace}.${r.collection} similar to ${subject} (${r.mode}):`];
  for (const h of r.hits.slice(0, MAX_LINES)) {
    lines.push(`${h.rank}. ${h.title} — ${h.similarity === null ? "n/a" : h.similarity.toFixed(3)} [${h.id}]`);
  }
  if (r.hits.length > MAX_LINES) lines.push(`… ${r.hits.length - MAX_LINES} more`);
  return lines.join("\n");
}

export function exploreSummary(r: ExploreResultT): string {
  const head = `${r.keyspace}.${r.collection}: ${r.documents.length} document(s)${r.filter ? ` matching ${JSON.stringify(r.filter)}` : ""}${r.nextPageState ? " (more pages available)" : ""}.`;
  const fields = r.fields.length ? ` Fields: ${r.fields.slice(0, 12).map((f) => `${f.name}:${f.type}`).join(", ")}.` : "";
  const rows = r.documents.slice(0, MAX_LINES).map((d) => `- ${String(d._id)}: ${r.displayFields.map((f) => `${f}=${JSON.stringify(d[f])}`).join(" ")}`);
  return [head + fields, ...rows].join("\n");
}
