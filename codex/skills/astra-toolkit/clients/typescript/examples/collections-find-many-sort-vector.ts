import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find documents
(async function () {
  const cursor = collection.find(
    {},
    {
      sort: { $vectorize: "Text to vectorize" },
      includeSortVector: true,
    },
  );

  // Get the sort vector from the result
  const vector = await cursor.getSortVector();
  console.log(vector);
})();
