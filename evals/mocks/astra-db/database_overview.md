2f0c6a3e-8d1b-4c55-9a7e-1b2c3d4e5f60-us-east-2.apps.astra.datastax.com: 1 keyspace(s), 4 collection(s), 0 table(s), ~19 documents.
- default_keyspace.articles: 1024d cosine via nv-embedqa-e5-v5, lexical, rerank, ~8 docs
- default_keyspace.orders: no vector, ~3 docs
- default_keyspace.products: no vector, ~5 docs
- default_keyspace.scratch_embeddings: 1536d dot_product, ~3 docs

{"view":"overview","endpointHost":"2f0c6a3e-8d1b-4c55-9a7e-1b2c3d4e5f60-us-east-2.apps.astra.datastax.com","database":{"id":"2f0c6a3e-8d1b-4c55-9a7e-1b2c3d4e5f60","region":"us-east-2"},"keyspaces":[{"name":"default_keyspace","isDefault":true,"collections":[{"name":"articles","vector":{"dimension":1024,"metric":"cosine","provider":"nvidia","model":"nv-embedqa-e5-v5"},"lexical":true,"rerank":true,"estimatedCount":8},{"name":"orders","vector":null,"lexical":false,"rerank":false,"estimatedCount":3},{"name":"products","vector":null,"lexical":false,"rerank":false,"estimatedCount":5},{"name":"scratch_embeddings","vector":{"dimension":1536,"metric":"dot_product","provider":null,"model":null},"lexical":false,"rerank":false,"estimatedCount":3}],"tables":[]}],"totals":{"keyspaces":1,"collections":4,"tables":0,"documents":19},"truncated":{"keyspaces":false,"items":false}}
