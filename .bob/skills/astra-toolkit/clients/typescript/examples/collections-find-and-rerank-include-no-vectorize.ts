import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  // Find documents
  const cursor = collection.findAndRerank(
    {},
    {
      sort: {
        $hybrid: {
          $vector: [0.08, -0.62, 0.39],
          $lexical: "house hill grassy",
        },
      },
      projection: { is_checked_out: 1, title: 1 },
      rerankQuery: "A house on a hill",
      rerankOn: "$lexical",
    },
  );

  // Iterate over the found documents
  for await (const result of cursor) {
    // Documents will only have the requested fields
    // (plus '_id' by default projection)
    console.log(result.document);
  }
})();
