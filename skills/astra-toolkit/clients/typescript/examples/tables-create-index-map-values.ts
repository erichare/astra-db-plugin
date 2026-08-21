import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Index a column
(async function () {
  await table.createIndex("**INDEX_NAME**", {
    "**MAP_COLUMN_NAME**": "$values",
  });
})();
