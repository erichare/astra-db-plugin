import { DataAPIClient } from "@datastax/astra-db-ts";

// Instantiate the client
const client = new DataAPIClient();

// Connect to a database
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Get an existing collection
const collection = database.collection("**COLLECTION_NAME**");

// Use vector search and filters to find a document
(async function () {
  const result = await collection.findOne(
    {
      $and: [{ is_checked_out: false }, { number_of_pages: { $lt: 300 } }],
    },
    { sort: { $vectorize: "A thrilling story set in a futuristic world" } },
  );

  console.log(result);
})();
