import { DataAPIClient, DataAPIVector } from "@datastax/astra-db-ts";

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
      summary_genres_vector: new DataAPIVector([0.08, -0.62, 0.39]),
    },
    {
      title: "Desert Peace",
      author: "Walter Dray",
      summary_genres_vector: new DataAPIVector([0.12, 0.53, 0.32]),
    },
  ]);
})();
