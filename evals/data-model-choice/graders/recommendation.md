---
type: llm
---

Score 1 only if the answer satisfies ALL of the following; otherwise score 0:

- Recommends Collections for this workload.
- Justifies the choice with at least two of these Astra DB-specific factors: (a) Collections support read-then-write primitives such as find-one-and-update while Tables do not, (b) Collections are schemaless and fit per-category flexible attributes while Tables use typed rows, (c) both support vector search so it does not decide the choice.
- Does not hallucinate unsupported capabilities (no claims of JOINs, multi-document transactions, aggregation pipelines, or group-by on Astra DB).
