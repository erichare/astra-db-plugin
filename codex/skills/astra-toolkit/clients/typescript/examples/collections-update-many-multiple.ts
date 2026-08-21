import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Update documents
(async function () {
  const result = await collection.updateMany(
    {
      $and: [{ is_checked_out: false }, { number_of_pages: { $lt: 300 } }],
    },
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
