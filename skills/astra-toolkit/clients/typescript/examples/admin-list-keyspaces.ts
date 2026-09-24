import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

// Get an admin object
const admin = database.admin();

// List keyspaces
(async function () {
  const keyspaces = await admin.listKeyspaces();

  console.log(keyspaces);
})();
