import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN!);

const admin = client.admin();

const databaseAdmin = admin.dbAdmin(process.env.ASTRA_DB_API_ENDPOINT!);

(async function () {
  const providers = await databaseAdmin.findRerankingProviders();

  console.log(JSON.stringify(providers));
})();
