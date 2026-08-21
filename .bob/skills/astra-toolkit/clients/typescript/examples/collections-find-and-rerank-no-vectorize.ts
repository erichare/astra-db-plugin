import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  const cursor = collection.findAndRerank(
    {},
    {
      sort: {
        $hybrid: {
          $vector: [0.08, -0.62, 0.39],
          $lexical: "house hill grassy",
        },
      },
      rerankQuery: "A tree in the woods",
      rerankOn: "$lexical",
    },
  );

  // Iterate over the found documents
  for await (const result of cursor) {
    console.log(result.document);
  }
})();
