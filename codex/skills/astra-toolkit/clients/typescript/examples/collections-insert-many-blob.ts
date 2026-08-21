import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Insert a document with a binary field
(async function () {
  const result = await collection.insertMany([
    {
      exampleBinary: { $binary: "PfvnbT7peNU/Sfvn" },
    },
  ]);
})();
