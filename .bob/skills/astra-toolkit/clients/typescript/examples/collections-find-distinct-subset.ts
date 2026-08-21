import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  // Find distinct values
  const result = await collection.distinct("publication_year", {
    $and: [{ is_checked_out: false }, { number_of_pages: { $lt: 300 } }],
  });

  console.log(result);
})();
