import {
  DataAPIClient,
  CollectionInsertManyError,
} from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

// Insert documents into the collection
(async function () {
  try {
    const result = await collection.insertMany([
      {
        name: "Jane Doe",
        age: 42,
        $vectorize: "Text to vectorize for this document",
      },
      {
        nickname: "Bobby",
        $vectorize: "Text to vectorize for this document",
      },
    ]);
  } catch (error) {
    if (error instanceof CollectionInsertManyError) {
      console.log(error.insertedIds());
    }
  }
})();
