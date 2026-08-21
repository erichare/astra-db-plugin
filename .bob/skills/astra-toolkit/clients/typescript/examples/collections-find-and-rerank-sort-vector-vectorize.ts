import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  // Find documents
  const cursor = collection.findAndRerank(
    {},
    {
      sort: { $hybrid: "A tree in the woods" },
      includeSortVector: true,
    },
  );

  // Inspect the sort vector
  console.log(await cursor.getSortVector());
})();
