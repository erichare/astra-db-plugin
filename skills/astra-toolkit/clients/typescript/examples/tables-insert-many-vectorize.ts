import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const table = database.table("**TABLE_NAME**");

// Insert rows into the table
(async function () {
  const result = await table.insertMany([
    {
      title: "Computed Wilderness",
      author: "Ryan Eau",
      summary_genres_vector: "Text to vectorize",
      summary_genres_original_text: "Text to vectorize",
    },
    {
      title: "Desert Peace",
      author: "Walter Dray",
      summary_genres_vector: "Text to vectorize",
      summary_genres_original_text: "Text to vectorize",
    },
  ]);
})();
