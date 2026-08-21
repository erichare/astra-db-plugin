import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Drop a table
(async function () {
  await database.dropTable("**TABLE_NAME**", { ifExists: true });
})();
