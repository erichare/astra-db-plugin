import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
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
    { $max: { rating: 3.9 } },
  );

  console.log(result);
})();
