import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const table = database.table("**TABLE_NAME**");

// Add a vector column
(async function () {
  await table.alter({
    operation: {
      add: {
        columns: {
          example_vector: { type: "vector", dimension: 1024 },
        },
      },
    },
  });
})();
