import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// List table metadata
(async function () {
  const result = await database.listTables({
    keyspace: "**KEYSPACE_NAME**",
  });

  console.log(result);
})();
