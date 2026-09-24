import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

// Replace a document
(async function () {
  const result = await collection.replaceOne(
    {
      $and: [{ is_checked_out: false }, { number_of_pages: { $lt: 300 } }],
    },
    {
      is_checked_out: true,
      borrower: "Brook Reed",
    },
  );

  console.log(result);
})();
