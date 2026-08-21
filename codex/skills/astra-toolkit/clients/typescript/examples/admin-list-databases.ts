import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient("**APPLICATION_TOKEN**");

const admin = client.admin();

(async function () {
  const databases = await admin.listDatabases();

  console.log(databases);
})();
