import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

// Update a document
(async function () {
  const result = await collection.updateOne(
    { $lexical: { $match: "tree hill" } },
    { $set: { color: "blue" } },
    {
      sort: {
        $lexical: "tree hill grassy",
      },
    },
  );

  console.log(result);
})();
