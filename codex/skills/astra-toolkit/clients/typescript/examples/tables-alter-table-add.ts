import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Add columns
(async function () {
  await table.alter({
    operation: {
      add: {
        columns: {
          is_summer_reading: "boolean",
          library_branch: "text",
        },
      },
    },
  });
})();
