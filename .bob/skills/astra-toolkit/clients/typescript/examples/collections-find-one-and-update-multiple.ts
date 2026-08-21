import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Update a document
(async function () {
  const result = await collection.findOneAndUpdate(
    { _id: "101" },
    {
      $set: {
        color: "blue",
        classes: ["biology", "algebra", "swimming"],
      },
      $unset: {
        phone: "",
      },
      $inc: {
        age: 1,
      },
    },
  );

  console.log(result);
})();
