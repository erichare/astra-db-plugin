import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database object
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Get a database admin object
const databaseAdmin = database.admin();
