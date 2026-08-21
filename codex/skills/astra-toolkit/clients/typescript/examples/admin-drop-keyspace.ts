import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Get an admin object
const admin = database.admin();

// Drop a keyspace
(async function () {
  await admin.dropKeyspace("**KEYSPACE_NAME**");
})();
