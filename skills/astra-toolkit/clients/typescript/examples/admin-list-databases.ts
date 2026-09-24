import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);

const admin = client.admin();

(async function () {
  const databases = await admin.listDatabases();

  console.log(databases);
})();
