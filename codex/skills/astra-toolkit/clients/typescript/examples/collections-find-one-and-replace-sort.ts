import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Replace a document
(async function () {
  const result = await collection.findOneAndReplace(
    { "metadata.language": "English" },
    {
      is_checked_out: false,
      number_of_pages: 400,
    },
    {
      sort: {
        rating: 1, // ascending
        title: -1, // descending
      },
    },
  );

  console.log(result);
})();
