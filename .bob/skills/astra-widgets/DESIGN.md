# Astra widgets — design spec

Blueprints live in `templates/`; fill them from the tool's `structuredContent`. These rules keep every widget native to the host, readable in light and dark mode, and consistent across the four views.

## Foundations

- **Surfaces**: one raised card per widget: `background: var(--surface-2); border: 0.5px solid var(--border); border-radius: 12px; padding: 1rem 1.25rem`. Metric tiles inside it use `background: var(--surface-1); border-radius: var(--radius)`, no border.
- **Text**: `var(--text-primary)` for values and names, `var(--text-secondary)` for supporting copy, `var(--text-muted)` for hints and axis labels. Never hardcode colors. Two weights only: 400 and 500. Headings inside widgets are 16px/500; body 14px; captions 12–13px; never below 11px. Sentence case everywhere.
- **Accent**: purple only, via the host's `pro` role — `var(--bg-pro)` for soft fills, `var(--text-pro)` for text on them, `var(--fill-pro)` for bars, dots, and the single primary action. Status colors only for status (`--text-success` for "rerank on", `--text-danger` for errors).
- **Chips**: `display:inline-flex; padding:2px 9px; border-radius:999px; font-size:12px; background: var(--surface-1); border: 0.5px solid var(--border)`; accent chips swap to `background: var(--bg-pro); color: var(--text-pro); border-color: transparent`.
- **Icons**: Tabler outline only, 16–18px, `aria-hidden="true"`: `ti-database` (database), `ti-box` (collection), `ti-table` (table), `ti-vector-triangle` (vector), `ti-search` (similarity), `ti-list-details` (explorer), `ti-arrow-right` on drill-down buttons.
- **Accessibility**: first element is `<h2 class="sr-only">…</h2>` with a one-sentence summary; charts/SVGs get `role="img"` + `aria-label`; buttons that trigger `sendPrompt` end their label with ↗.
- **Layout**: widget width is 680px; grids use `repeat(auto-fit, minmax(160px, 1fr))`; tables use `table-layout: fixed` with ≤5 columns; no nested scrolling, no `position: fixed`, no gradients or shadows, no tabs during streaming (toggle views with post-stream JS).
- **Numbers**: `toFixed(3)` for similarity, `toLocaleString()` for counts, `~` prefix on estimated counts.

## Overview (`templates/overview.html`)

Header (database host + "Astra DB" chip) → 4 metric tiles (keyspaces, collections, tables, ~documents) → one section per keyspace: a fixed table with columns collection / vector (`1024d · cosine` chip) / capabilities (vectorize model chip, lexical, rerank) / ~documents; tables listed as chips beneath. Row click → `sendPrompt('Show the collection card for <name>')`.

## Collection card (`templates/collection-card.html`)

Header (name, "Collection · keyspace X", chips for vector, vectorize model, lexical, rerank) → metric tiles (documents, dimension, metric, default id) → definition table (vectorize, rerank, lexical, indexing) → sample document in a `<pre>` (max 260px, `var(--surface-1)`) → field chips → action row: "Explore documents ↗" and a search input + "Search ↗" (text query when vectorize is on, otherwise document id).

## Similarity (`templates/similarity.html`)

Header (“Similar to *query*”, mode, collection, top-k) + Ranked/Constellation toggle → stat chips (best, mean, lowest) → **Ranked**: rows of rank · title · secondary fields · score chip, with a 6px bar whose width is `similarity × 100%` in `var(--fill-pro)` on `var(--surface-1)`; row click → `sendPrompt('Find documents similar to <id> in <collection>')`. **Constellation**: 640×360 SVG, query dot at the center, three dashed rings, each hit at angle `rank × golden angle` and radius `30 + 135 × (1 − (sim − min)/(max − min))`, dot radius 6–10 by score, labels clipped to 28 chars, `<title>` with rank/title/score; caption “Closer to the center = more similar”.

## Explorer (`templates/explorer.html`)

Header (collection, "Explorer · keyspace X · N loaded · more available", active filter chips with a Clear ↗) → field chips (`name · type`) → fixed table: `_id` + up to four display fields (+ a "Similar ↗" button column); cell click → `sendPrompt('Explore <collection> filtered by <field> = <value>')`; row click expands the full JSON beneath; footer: "Show 10 more" (local) and "Load next page ↗" (`sendPrompt('Show the next page of <collection>')`).

## Data → markup

| structuredContent | Shown as |
| --- | --- |
| `totals.*`, `keyspaces[].collections[]` | overview tiles and rows |
| `vector.{dimension,metric,provider,model}` | `1024d · cosine` chip + model chip |
| `estimatedCount` | `~12,345` |
| `hits[].{rank,title,fields,similarity,id}` | ranked rows / constellation dots |
| `stats.{max,mean,min}` | stat chips |
| `documents[]`, `displayFields`, `fields`, `nextPageState` | explorer table, field chips, paging |
