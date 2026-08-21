import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

(async function () {
  const collection = await database.createCollection("**COLLECTION_NAME**", {
    indexing: {
      allow: ["city", "country"],
    },
  });
})();
