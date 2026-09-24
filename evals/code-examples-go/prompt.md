---
name: code-examples-go
description: Go application code follows the bundled, documentation-derived examples (via the code_examples tool or the skill).
tags: [go, collections, vectorize, mcp]
runs: 2
max_turns: 12
allowed_tools: [Read, Glob, Grep, Skill, Write, mcp__plugin_astra-db_astra-db__code_examples, mcp__plugin_astra-db_astra-db__describe_collection]
---

Write a Go program `main.go` using the official Astra DB Go client that:

1. Connects using the `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` environment variables.
2. Inserts two documents with a `title` into the existing `articles` collection, letting Astra DB embed each title server-side with `$vectorize`.
3. Runs a vectorize similarity search for "black holes" that returns the 5 closest documents and prints their titles.

Do not run the program and do not contact any database — just write the file.
