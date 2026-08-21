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
    {},
    { sort: { summary_genres_vector: "Text to vectorize" } },
  );

  // Iterate over the found rows
  for await (const row of cursor) {
    console.log(row);
  }
})();
