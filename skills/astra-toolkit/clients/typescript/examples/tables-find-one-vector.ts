import { DataAPIClient, DataAPIVector } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Find a row
(async function () {
  const result = await table.findOne(
    {},
    { sort: { summary_genres_vector: new DataAPIVector([0.08, -0.62, 0.39]) } },
  );

  console.log(result);
})();
