/** One-glance text summaries that lead every tool result (the JSON payload follows). */
import type {
  CollectionResultT, CountResultT, DatabasesResultT, DistinctResultT, ExamplesResultT, ExplorerResultT,
  MutationResultT, OverviewResultT, ProvidersResultT, SimilarityResultT, StatusResultT, TableResultT,
} from "./schemas.js";

const MAX_LINES = 10;
const fmt = (n: number | null | undefined) => (n == null ? "?" : n.toLocaleString("en-US"));

export function statusSummary(r: StatusResultT): string {
  if (!r.configured) return "Astra DB is not configured: no token found.";
  const where = r.database?.name ?? r.endpoint?.host ?? "database picked via DevOps API";
  const check = r.checks.dataApi
    ? r.checks.dataApi.ok
      ? ` Connected: ${r.checks.dataApi.collections} collection(s), ${r.checks.dataApi.tables} table(s) in keyspace ${r.keyspace?.value ?? "default"}.`
      : ` Connection failed: ${r.checks.dataApi.message}`
    : "";
  return `Astra DB configured (token from ${r.token?.detail}) → ${where}${r.readOnly ? " [read-only]" : ""}.${check}`;
}

export function databasesSummary(r: DatabasesResultT): string {
  const lines = [`${r.databases.length} database(s):`];
  for (const d of r.databases.slice(0, 20)) {
    lines.push(`- ${d.name} (${d.id}) ${d.status} ${d.regions.map((x) => x.name).join(",")}${d.current ? " ← current" : ""}`);
  }
  return lines.join("\n");
}

export function overviewSummary(r: OverviewResultT): string {
  const lines = [
    `${r.database.name ?? r.endpointHost}: ${r.totals.keyspaces} keyspace(s), ${r.totals.collections} collection(s), ${r.totals.tables} table(s)` +
      (r.totals.documents === null ? "" : `, ~${fmt(r.totals.documents)} documents`) + ".",
  ];
  for (const ks of r.keyspaces) {
    if (ks.error) lines.push(`- ${ks.name}: error — ${ks.error}`);
    for (const c of ks.collections.slice(0, MAX_LINES)) {
      const vec = c.vector ? `${c.vector.dimension ?? "?"}d ${c.vector.metric ?? ""}${c.vector.model ? ` via ${c.vector.model}` : ""}` : "no vector";
      lines.push(`- ${ks.name}.${c.name}: ${vec}${c.lexical ? ", lexical" : ""}${c.rerank ? ", rerank" : ""}${c.estimatedCount === null ? "" : `, ~${fmt(c.estimatedCount)} docs`}`);
    }
    if (ks.collections.length > MAX_LINES) lines.push(`- … ${ks.collections.length - MAX_LINES} more collection(s) in ${ks.name}`);
    if (ks.tables.length) lines.push(`- ${ks.name} tables: ${ks.tables.map((t) => t.name).join(", ")}`);
  }
  if (r.truncated.keyspaces || r.truncated.items) lines.push("(truncated — pass keyspaces or raise maxPerKeyspace)");
  return lines.join("\n");
}

export function collectionSummary(r: CollectionResultT): string {
  const vec = r.vector
    ? `${r.vector.dimension ?? "?"}d ${r.vector.metric ?? ""}${r.vector.model ? `, vectorize ${r.vector.provider}/${r.vector.model}` : ""}`
    : "no vector";
  return [
    `Collection ${r.keyspace}.${r.name}: ${r.estimatedCount === null ? "count unknown" : `~${fmt(r.estimatedCount)} documents`}; ${vec}`,
    r.rerank.enabled ? `rerank ${r.rerank.provider}/${r.rerank.model}` : "",
    r.lexical.enabled ? "lexical enabled" : "",
    r.indexing.deny ? `indexing deny ${r.indexing.deny.join(",")}` : r.indexing.allow ? `indexing allow ${r.indexing.allow.join(",")}` : "",
    r.defaultIdType ? `defaultId ${r.defaultIdType}` : "",
    r.fields.length ? `fields: ${r.fields.map((f) => `${f.name}:${f.type}`).join(", ")}` : "",
  ].filter(Boolean).join("; ") + ".";
}

export function tableSummary(r: TableResultT): string {
  const pk = `PRIMARY KEY ((${r.primaryKey.partitionBy.join(", ")})${Object.keys(r.primaryKey.partitionSort).length ? `, ${Object.entries(r.primaryKey.partitionSort).map(([k, v]) => `${k} ${v === 1 ? "ASC" : "DESC"}`).join(", ")}` : ""})`;
  const cols = r.columns.map((c) => `${c.name} ${c.type}${c.detail ? `<${c.detail}>` : ""}`).join(", ");
  const idx = r.indexes.length ? ` Indexes: ${r.indexes.map((i) => `${i.name}(${i.column}, ${i.type})`).join(", ")}.` : " No secondary indexes.";
  return `Table ${r.keyspace}.${r.name}: ${cols}; ${pk}.${idx}`;
}

export function explorerSummary(r: ExplorerResultT): string {
  const head = `${r.keyspace}.${r.name}: ${r.documents.length} ${r.kind === "table" ? "row" : "document"}(s)` +
    `${r.filter ? ` matching ${JSON.stringify(r.filter)}` : ""}${r.nextPageState ? " (more pages: pass nextPageState)" : ""}.`;
  const fields = r.fields.length ? ` Fields: ${r.fields.slice(0, 12).map((f) => `${f.name}:${f.type}`).join(", ")}.` : "";
  return head + fields;
}

export function similaritySummary(r: SimilarityResultT): string {
  const subject = r.query ? `"${r.query}"` : r.documentId ? `document ${r.documentId}` : "the query vector";
  const lines = [`Top ${r.hits.length} in ${r.keyspace}.${r.name} for ${subject} (${r.mode}):`];
  for (const h of r.hits.slice(0, MAX_LINES)) {
    lines.push(`${h.rank}. ${h.title} — ${h.similarity === null ? "n/a" : h.similarity.toFixed(3)} [${h.id}]`);
  }
  if (r.hits.length > MAX_LINES) lines.push(`… ${r.hits.length - MAX_LINES} more`);
  for (const w of r.warnings) lines.push(`Note: ${w}`);
  return lines.join("\n");
}

export function countSummary(r: CountResultT): string {
  const n = r.exceedsUpperBound ? `more than ${fmt(r.upperBound)}` : fmt(r.count);
  return `${n} document(s) in ${r.keyspace}.${r.name}${r.filter ? ` matching ${JSON.stringify(r.filter)}` : ""}` +
    `${r.estimatedTotal !== null ? ` (estimated total ~${fmt(r.estimatedTotal)})` : ""}.`;
}

export function distinctSummary(r: DistinctResultT): string {
  const shown = r.values.slice(0, 25).map((v) => JSON.stringify(v)).join(", ");
  return `${r.values.length} distinct value(s) of ${r.field} in ${r.keyspace}.${r.name} (scanned ${r.scanned}${r.complete ? "" : ", partial"}): ${shown}${r.values.length > 25 ? ", …" : ""}`;
}

export function providersSummary(r: ProvidersResultT): string {
  const lines: string[] = [];
  if (r.embedding.length) {
    lines.push("Embedding (vectorize) providers:");
    for (const p of r.embedding) lines.push(`- ${p.provider}: ${p.models.map((m) => `${m.name}${m.dimension ? ` (${m.dimension}d)` : ""}`).join(", ")}${p.authentication.length ? ` [auth: ${p.authentication.join("/")}]` : ""}`);
  }
  if (r.reranking.length) {
    lines.push("Reranking providers:");
    for (const p of r.reranking) lines.push(`- ${p.provider}: ${p.models.map((m) => `${m.name}${m.isDefault ? " (default)" : ""}`).join(", ")}`);
  }
  return lines.join("\n") || "No providers reported.";
}

export function examplesSummary(r: ExamplesResultT): string {
  if (!r.results.length) return `No ${r.language} examples matched "${r.query}". Browse ${r.indexFile} for the full map.`;
  const lines = [`${r.results.length} ${r.language} example(s) for "${r.query}":`];
  for (const x of r.results) {
    lines.push(`\n### ${x.file}${x.content ? `\n\`\`\`${r.language === "csharp" ? "cs" : r.language}\n${x.content.trim()}\n\`\`\`` : ""}`);
  }
  return lines.join("\n");
}

export function mutationSummary(r: MutationResultT): string {
  const failures = r.failures?.length ? `\nErrors: ${r.failures.map((f) => f.message).slice(0, 3).join(" | ")}` : "";
  return `${r.message}${failures}`;
}
