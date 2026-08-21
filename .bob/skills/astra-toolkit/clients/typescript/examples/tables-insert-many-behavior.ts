import { DataAPIClient, date } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Insert rows into the table
(async function () {
  const result = await table.insertMany(
    [
      {
        title: "Computed Wilderness",
        author: "Ryan Eau",
        number_of_pages: 432,
        due_date: date("2024-12-18"),
        genres: new Set(["History", "Biography"]),
      },
      {
        title: "Desert Peace",
        author: "Walter Dray",
        number_of_pages: 355,
        rating: 4.5,
      },
    ],
    {
      chunkSize: 2,
      concurrency: 2,
      ordered: false,
    },
  );
})();
