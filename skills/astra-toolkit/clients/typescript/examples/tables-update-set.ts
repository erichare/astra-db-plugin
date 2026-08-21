import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Update a row
(async function () {
  await table.updateOne(
    {
      title: "Hidden Shadows of the Past",
      author: "John Anthony",
    },
    {
      $set: {
        rating: 4.5,
        genres: ["Fiction", "Drama"],
      },
    },
  );
})();
