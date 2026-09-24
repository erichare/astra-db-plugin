import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const table = database.table("**TABLE_NAME**");

// Index a vector column
(async function () {
  await table.createVectorIndex("**INDEX_NAME**", "**VECTOR_COLUMN_NAME**", {
    ifNotExists: true,
  });
})();
