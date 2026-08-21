import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Index a vector column
(async function () {
  await table.createVectorIndex("**INDEX_NAME**", "**VECTOR_COLUMN_NAME**", {
    options: {
      metric: "dot_product",
      sourceModel: "nv-qa-4",
    },
  });
})();
