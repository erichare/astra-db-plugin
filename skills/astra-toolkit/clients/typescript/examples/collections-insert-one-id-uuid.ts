import { DataAPIClient, UUID } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

// Insert a document into the collection
(async function () {
  const result = await collection.insertOne({
    _id: UUID.v7(),
    name: "Jane Doe",
  });
})();
