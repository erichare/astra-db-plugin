import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

// List table metadata
(async function () {
  const result = await database.listTables({
    keyspace: "**KEYSPACE_NAME**",
  });

  console.log(result);
})();
