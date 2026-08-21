import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Drop columns
(async function () {
  await table.alter({
    operation: {
      drop: {
        columns: ["is_summer_reading", "library_branch"],
      },
    },
  });
})();
