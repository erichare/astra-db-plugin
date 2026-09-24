# Typescript client

Examples: [INDEX.md](INDEX.md) maps every snippet in [examples/](examples/) by category and operation. Snippets read `ASTRA_DB_APPLICATION_TOKEN` / `ASTRA_DB_API_ENDPOINT` from the environment.

The package is `astra-db-ts`.

Installation (if not using `npm`, adapt):

```
npm install @datastax/astra-db-ts
```

## Connect to HCD

E.g. `ENDPOINT="http://localhost:8181"`:

```
import {
  DataAPIClient,
  UsernamePasswordTokenProvider,
} from "@datastax/astra-db-ts";

const client = new DataAPIClient({ environment: "hcd" });

const database = client.db(ENDPOINT, {
    token: new UsernamePasswordTokenProvider(USERNAME, PASSWORD),
    keyspace: KEYSPACE,
});

// what follows is like for Astra DB ...
```
