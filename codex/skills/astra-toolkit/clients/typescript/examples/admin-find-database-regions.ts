import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient("**APPLICATION_TOKEN**");

const admin = client.admin();

(async function () {
  const regions = await admin.findAvailableRegions();

  console.log(regions);
})();
