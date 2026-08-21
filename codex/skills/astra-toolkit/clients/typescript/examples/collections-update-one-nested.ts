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
    { _id: "101" },
    {
      $set: {
        color: "blue",
        "address.city": "Austin",
        "classes.2": "biology",
      },
    },
  );

  console.log(result);
})();
