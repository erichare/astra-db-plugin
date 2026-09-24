import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const table = database.table("**TABLE_NAME**");

// Index a column
(async function () {
  await table.createTextIndex("**INDEX_NAME**", "**TEXT_COLUMN_NAME**", {
    ifNotExists: true,
  });
})();
