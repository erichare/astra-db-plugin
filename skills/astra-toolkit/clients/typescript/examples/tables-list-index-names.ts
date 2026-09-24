import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const table = database.table("**TABLE_NAME**");

// List index names
(async function () {
  const result = await table.listIndexes({ nameOnly: true });

  console.log(result);
})();
