import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  const result = await collection.findOne(
    { "metadata.language": "English" },
    { projection: { is_checked_out: true, title: true } },
  );

  console.log(result);
})();
