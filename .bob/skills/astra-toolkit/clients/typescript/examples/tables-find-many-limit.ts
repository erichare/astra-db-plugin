import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

(async function () {
  // Find rows
  const cursor = table.find(
    {
      $and: [{ is_checked_out: false }, { number_of_pages: { $lt: 300 } }],
    },
    { limit: 3 },
  );

  // Iterate over the found rows
  for await (const row of cursor) {
    console.log(row);
  }
})();
