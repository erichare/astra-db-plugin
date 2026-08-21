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
    { is_checked_out: false },
    {
      sort: {
        rating: 1, // ascending
        title: -1, // descending
      },
      skip: 5,
    },
  );

  // Iterate over the found rows
  for await (const row of cursor) {
    console.log(row);
  }
})();
