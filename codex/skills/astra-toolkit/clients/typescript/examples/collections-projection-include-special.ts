import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Use a projection
(async function () {
  const result = await collection.findOne(
    { "metadata.language": "English" },
    { projection: { is_checked_out: false, title: false, $vectorize: true } },
  );

  console.log(result);
})();
