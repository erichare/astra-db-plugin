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
        $lexical: "An author who writes SciFi and fantasy novels.",
      },
      {
        name: "Mary Day",
        $lexical:
          "An active hiker, runner, and triathlete who loves the outdoors.",
      },
    ]);
  } catch (error) {
    if (error instanceof CollectionInsertManyError) {
      console.log(error.insertedIds());
    }
  }
})();
