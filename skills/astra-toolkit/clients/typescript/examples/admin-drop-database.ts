import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient("**APPLICATION_TOKEN**");

const admin = client.admin();

(async function () {
  await admin.dropDatabase("**DATABASE_ID**");
})();
