import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

(async function () {
  const collection = await database.createCollection("**COLLECTION_NAME**", {
    indexing: {
      deny: ["city", "country"],
    },
  });
})();
