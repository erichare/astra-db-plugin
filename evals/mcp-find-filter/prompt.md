---
name: mcp-find-filter
description: A filtered, sorted lookup inspects the collection first, then runs find with the real field names.
tags: [mcp, queries, collections]
runs: 2
max_turns: 10
allowed_tools: [Skill, mcp__plugin_astra-db_astra-db__database_overview, mcp__plugin_astra-db_astra-db__describe_collection, mcp__plugin_astra-db_astra-db__find, mcp__plugin_astra-db_astra-db__count]
---

Show me the most recent pending orders for customer c-1042 from the `orders` collection in my Astra database — newest first, at most 5.
