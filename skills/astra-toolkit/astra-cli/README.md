# Astra CLI

Installation/configuration is a manual user task. For `command not found` or misconfiguration, ask the user to fix it.

**Always append `-q`** (quiet output). Add `-o json` for richer output.

### Profiles

Multiple configs (auth token + environment). Use `-p CONFIG` to target one; omit for default.
List: `astra config` — `astra config --help` for more.

## Databases

Identified by UUID or name (prefer ID if ambiguous).

### Inspect

```
astra db list -q
astra db get <name|ID> -q
astra db status <name|ID> -q
astra db list-keyspaces <DB> -q
astra db list-tables <DB> -q
astra db list-collections <DB> -q
astra db describe-table <DB> -t <table> [-k keyspace] -q
astra db describe-collection <DB> -t <collection> [-k keyspace] -q
```

### Act

```
astra db resume <name|ID> -q [--async]
astra db create <name> --region <REGION> [-k KEYSPACE] [--async]
astra db create-keyspace <name|ID> -k <keyspace> -q
```

List regions: `astra db regions vector -q`. `create` can take several minutes; use `--async` + poll `db status`.

### Dotenv for applications

```
astra dotenv write --db <DB> -k=ASTRA_DB_TOKEN=ASTRA_DB_APPLICATION_TOKEN,ASTRA_DB_API_ENDPOINT=ASTRA_DB_API_ENDPOINT -f <FILE>
```

App loads the file (e.g. `python-dotenv`) and reads `ASTRA_DB_APPLICATION_TOKEN` and `ASTRA_DB_API_ENDPOINT` — the names every example uses.
Without the CLI, `npx -y @erichare/astra-mcp login` (run by the user in a terminal) writes the same `.env` interactively.

### Destructive operations — DO NOT perform, defer to the user

- Truncate/drop tables or collections
- Delete keyspaces or databases

## General

`astra help` / `astra <command> --help` when needed. Avoid interactive commands.
