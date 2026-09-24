# Go examples index

307 snippets in [examples/](examples/). Each file is `examples/<category>-<operation>[-<variant>].go`;
every line below is one operation followed by its variants. Snippets read credentials from
`ASTRA_DB_APPLICATION_TOKEN` / `ASTRA_DB_API_ENDPOINT`; other `**PLACEHOLDERS**` are yours to fill in.
Some files hold several snippets separated by a `BOUNDARY BETWEEN EXAMPLE SNIPPETS` comment.

## client (1)

- `client-get-astra-admin`

## admin (5)

- `admin-drop-database`
- `admin-find`: database, embedding-providers
- `admin-find-database`: regions
- `admin-list-databases`

## collections (194)

- `collections-count`: all, filter
- `collections-create-collection`: default-id, hybrid, keyspace, lexical, no-vector, vector
- `collections-create-collection-index`: allow, deny
- `collections-date`
- `collections-dedup`
- `collections-delete-many`: all, filter
- `collections-delete-one`: filter, id, sort, vector, vectorize
- `collections-drop-collection`
- `collections-estimate-count`
- `collections-filter`: all, eq, exists, gt, gte, in, lt, lte, match, ne, nested, nin, not, size
- `collections-filter-compound`: logic, range
- `collections-find-and-rerank`: hybrid, no-vectorize, vectorize-lexical
- `collections-find-and-rerank-filter`: no-vectorize, vectorize
- `collections-find-and-rerank-include`: no-vectorize, vectorize
- `collections-find-and-rerank-limit`: no-vectorize, vectorize
- `collections-find-and-rerank-rerank-query`: no-vectorize, vectorize
- `collections-find-and-rerank-scores`: no-vectorize, vectorize
- `collections-find-and-rerank-sort-vector`: no-vectorize, vectorize
- `collections-find-and-rerank-underlying-limit`: no-vectorize, vectorize
- `collections-find-many`: all, combo, escape, exclude, filter, include, iterate, lexical, limit, similarity, skip, sort, vector, vectorize
- `collections-find-many-iterate`: manual
- `collections-find-many-sort`: vector
- `collections-find-one`: combo, escape, exclude, filter, id, include, lexical, similarity, sort, vector, vectorize
- `collections-find-one-and-delete`: exclude, filter, id, include, sort, vector, vectorize
- `collections-find-one-and-replace`: after, escape, exclude, filter, id, include, nested, sort, upsert, vector, vectorize
- `collections-find-one-and-replace-vector`: 2
- `collections-find-one-and-replace-vectorize`: 2
- `collections-find-one-and-update`: after, escape, exclude, filter, id, include, multiple, nested, set-on-insert, sort, upsert, vector, vectorize
- `collections-get`: collection
- `collections-get-collection`: keyspace
- `collections-insert-many`: blob, generic, hybrid, id, lexical, nested, options, vector, vectorize
- `collections-insert-one`: blob, generic, hybrid, lexical, nested, vector, vectorize
- `collections-insert-one-id`: int, objectid, uuid
- `collections-insert-one-lexical`: vector, vectorize
- `collections-intro`
- `collections-list-collection`: metadata, names
- `collections-migrate-collection`
- `collections-projection`: exclude, include, nested, slice
- `collections-projection-exclude`: all, id
- `collections-projection-include`: all, special
- `collections-replace-one`: escape, filter, id, nested, sort, upsert, vector, vectorize
- `collections-replace-one-vector`: 2
- `collections-replace-one-vectorize`: 2
- `collections-sort`: fields, hybrid, lexical, vector, vectorize
- `collections-update`: addToSet, currentDate, each, inc, max, min, mul, pop, position, push, rename, set, setOnInsert, unset
- `collections-update-many`: escape, filter, multiple, nested, set-on-insert, upsert
- `collections-update-one`: escape, filter, id, lexical, multiple, nested, set-on-insert, upsert, vector, vectorize

## tables (87)

- `tables-alter-table`: add, drop
- `tables-alter-table-add`: vector
- `tables-alter-table-drop`: vectorize
- `tables-alter-type`: add, rename
- `tables-create`: type
- `tables-create-index`: ascii, case, exists, general, unicode
- `tables-create-index-map`: keys, values
- `tables-create-table`: composite-primary-key, compound-primary-key, keyspace, single-column-primary-key, udt, vector
- `tables-create-text-index`: default-analyzer, exists, object-analyzer, string-analyzer
- `tables-create-type`: exists
- `tables-create-vector-index`: default, exists, specify
- `tables-delete`: one-primary
- `tables-delete-many`: all, composite-primary-key, compound-primary-key, primary, single-column-primary-key
- `tables-drop`: index, type
- `tables-drop-index`: exists
- `tables-drop-table`: exists, name
- `tables-drop-type`: exists
- `tables-find-many`: all, combo, exclude, filter, include, iterate, lexical, limit, similarity, skip, sort, vector, vectorize
- `tables-find-many-iterate`: manual
- `tables-get-table`: default, keyspace
- `tables-insert-many`: behavior, generic, map, vector, vectorize
- `tables-insert-one`: blob, generic, map, vector, vectorize
- `tables-list`: type-names, types
- `tables-list-index`: metadata, names
- `tables-list-metadata`: default, keyspace
- `tables-list-names`: default, keyspace
- `tables-migrate`
- `tables-projection`: exclude, include
- `tables-projection-include`: all
- `tables-update`: set
- `tables-update-one`: multicolumn, udt, unset
- `tables-update-pullall`: list, map
- `tables-update-push`: list, map
- `tables-update-set`: map

## vectorize (20)

- `vectorize-alter-table-add`: azure-openai, hugging-face-dedicated, nvidia, openai, template-other
- `vectorize-alter-table-enable`: azure-openai, hugging-face-dedicated, nvidia, openai, template-other
- `vectorize-collection`: azure-openai, hugging-face-dedicated, nvidia, openai, template-other
- `vectorize-table`: azure-openai, hugging-face-dedicated, nvidia, openai, template-other
