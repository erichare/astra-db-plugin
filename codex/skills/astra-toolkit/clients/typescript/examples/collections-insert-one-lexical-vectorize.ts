import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Insert a document into the collection
(async function () {
  const result = await collection.insertOne({
    name: "Jane Doe",
    $vectorize:
      "An athlete who loves biking, hiking, running, and swimming in the outdoors",
    $lexical: "She shares her love of triathlons by coaching kids after school",
  });
})();
