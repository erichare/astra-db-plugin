import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Replace a document
(async function () {
  const result = await collection.findOneAndReplace(
    { _id: "101" },
    {
      name: "Jane Doe",
      $vectorize: "Text to vectorize",
    },
  );

  console.log(result);
})();
