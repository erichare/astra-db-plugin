---
name: mcp-vector-search
description: A natural-language similarity question goes through the live vector_search tool, and the answer reports the real hits.
tags: [mcp, vector, collections]
runs: 2
max_turns: 8
allowed_tools: [Skill, mcp__plugin_astra-db_astra-db__database_overview, mcp__plugin_astra-db_astra-db__describe_collection, mcp__plugin_astra-db_astra-db__vector_search, mcp__plugin_astra-db_astra-db__find]
---

Which 3 articles in the `articles` collection of my Astra database are most relevant to "how do black holes evaporate"? Give me their titles and similarity scores.
