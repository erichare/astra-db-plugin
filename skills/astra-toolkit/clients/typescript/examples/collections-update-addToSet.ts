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
    {
      $and: [
        { title: "Into Shadows of Tomorrow" },
        { author: "Nicole Wright" },
      ],
    },
    { $addToSet: { genres: "SciFi" } },
  );

  console.log(result);
})();
