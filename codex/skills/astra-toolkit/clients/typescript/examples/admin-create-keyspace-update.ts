import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Get an admin object
const admin = database.admin();

// Create a keyspace
(async function () {
  await admin.createKeyspace("**KEYSPACE_NAME**", { updateDbKeyspace: true });
})();
