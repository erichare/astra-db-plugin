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
    {
      sort: {
        rating: 1, // ascending
        title: -1, // descending
      },
      projection: {
        is_checked_out: true,
        title: true,
      },
    },
  );

  // Iterate over the found rows
  for await (const row of cursor) {
    console.log(row);
  }
})();
