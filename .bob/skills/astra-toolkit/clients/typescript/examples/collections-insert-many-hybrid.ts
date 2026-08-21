import {
  DataAPIClient,
  CollectionInsertManyError,
} from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Insert documents into the collection
(async function () {
  try {
    const result = await collection.insertMany([
      {
        name: "Jane Doe",
        $vector: [0.08, -0.62, 0.39],
        $lexical: "An author who writes SciFi and fantasy novels.",
      },
      {
        name: "Mary Day",
        $vectorize:
          "An athlete who loves biking, hiking, running, and swimming in the outdoors",
        $lexical:
          "She shares her love of triathlons by coaching kids after school.",
      },
      {
        name: "Bobby",
        $hybrid: "A software developer who enjoys managing databases",
      },
    ]);
  } catch (error) {
    if (error instanceof CollectionInsertManyError) {
      console.log(error.insertedIds());
    }
  }
})();
