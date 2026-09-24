import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  // Find documents
  const cursor = collection.find(
    { "metadata.language": "English" },
    { limit: 10 },
  );

  // Iterate over the found documents
  for await (const document of cursor) {
    console.log(document);
  }
})();
