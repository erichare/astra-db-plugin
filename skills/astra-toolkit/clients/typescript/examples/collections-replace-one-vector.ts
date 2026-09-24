import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

// Replace a document
(async function () {
  const result = await collection.replaceOne(
    {},
    {
      name: "Jane Doe",
      age: 42,
    },
    { sort: { $vector: [0.08, -0.62, 0.39] } },
  );

  console.log(result);
})();
