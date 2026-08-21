import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Drop an index
(async function () {
  await database.dropTableIndex("**INDEX_NAME**");
})();
