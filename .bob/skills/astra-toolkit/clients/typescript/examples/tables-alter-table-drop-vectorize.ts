import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Remove automatic embedding generation
(async function () {
  await table.alter({
    operation: {
      dropVectorize: {
        columns: ["plot_synopsis"],
      },
    },
  });
})();
