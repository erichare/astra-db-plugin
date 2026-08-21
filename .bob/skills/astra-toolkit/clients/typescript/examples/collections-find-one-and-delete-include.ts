import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find a document
(async function () {
  const result = await collection.findOneAndDelete(
    { "metadata.language": "English" },
    { projection: { is_checked_out: true, title: true } },
  );

  console.log(result);
})();
