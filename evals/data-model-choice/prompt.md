---
name: data-model-choice
tags: [data-modeling, collections, tables]
runs: 2
max_turns: 8
---

I'm building a product catalog on Astra DB. Each product has flexible attributes that vary by category, I need vector search over product descriptions, and a common operation is "read a product, then update its view counter" as a single primitive. Should I use Collections or Tables? Explain the deciding factors.
