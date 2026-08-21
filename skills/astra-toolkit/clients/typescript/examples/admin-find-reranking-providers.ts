import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient("**APPLICATION_TOKEN**");

const admin = client.admin();

const databaseAdmin = admin.dbAdmin("**API_ENDPOINT**");

(async function () {
  const providers = await databaseAdmin.findRerankingProviders();

  console.log(JSON.stringify(providers));
})();
