import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  // Find documents
  const cursor = await collection.findAndRerank({}).sort({
    $hybrid: {
      $vectorize: "A tree in the woods",
      $lexical: "house hill grassy",
    },
  });

  for await (const result of cursor) {
    console.log(result.document);
  }
})();
