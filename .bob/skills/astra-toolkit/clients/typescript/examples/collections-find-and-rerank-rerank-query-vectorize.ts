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
      rerankQuery: "A house on a hill",
    },
  );

  // Iterate over the found documents
  for await (const result of cursor) {
    console.log(result.document);
  }
})();
