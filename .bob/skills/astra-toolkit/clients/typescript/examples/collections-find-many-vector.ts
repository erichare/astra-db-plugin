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
    { sort: { $vector: [0.08, -0.62, 0.39] } },
  );

  // Iterate over the found documents
  for await (const document of cursor) {
    console.log(document);
  }
})();
