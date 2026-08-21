---
name: python-vector-collection
tags: [python, collections, vector]
runs: 2
max_turns: 12
---

Write a standalone Python script `main.py` that uses the Astra DB Data API Python client (astrapy) to:

1. Connect using the `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` environment variables.
2. Create a collection named `articles` with vector search enabled: 1024 dimensions, cosine similarity metric.
3. Insert one document with a `title` field and a vector value.
4. Run a vector similarity search that returns the 5 most similar documents.

Do not execute the script and do not contact any database — just write the file.
