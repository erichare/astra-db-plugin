import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database object
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

// Get a database admin object
const databaseAdmin = database.admin();
