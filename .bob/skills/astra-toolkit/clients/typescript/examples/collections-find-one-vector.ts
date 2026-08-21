import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find a document
(async function () {
  const result = await collection.findOne(
    {},
    { sort: { $vector: [0.08, -0.62, 0.39] } },
  );

  console.log(result);
})();
