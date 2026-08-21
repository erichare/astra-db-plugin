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
    { "metadata.language": "English" },
    {
      sort: {
        rating: 1, // ascending
        title: -1, // descending
      },
    },
  );

  console.log(result);
})();
