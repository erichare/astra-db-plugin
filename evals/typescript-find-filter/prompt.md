---
name: typescript-find-filter
tags: [typescript, collections, queries]
runs: 2
max_turns: 12
---

Write a TypeScript module `query.ts` that uses the Astra DB Data API TypeScript client (@datastax/astra-db-ts) to:

1. Connect using the `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` environment variables.
2. Query a collection named `products` for documents where `category` equals `"electronics"` AND `price` is less than 100.
3. Project only the `name`, `price`, and `category` fields.
4. Sort the results by `price` ascending and limit them to 20 documents.

Do not execute the code and do not contact any database — just write the file.
