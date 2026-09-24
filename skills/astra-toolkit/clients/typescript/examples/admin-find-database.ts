import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);

const admin = client.admin();

(async function () {
  const databaseInfo = await admin.dbInfo("**DATABASE_ID**");

  console.log(databaseInfo);
})();
