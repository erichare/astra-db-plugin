import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Find a row
(async function () {
  const result = await table.findOne({
    metadata: {
      $nin: [
        ["language", "French"],
        ["edition", "Illustrated Edition"],
      ],
    },
  });

  console.log(result);
})();
