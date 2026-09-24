import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});
const table = database.table("**TABLE_NAME**");

// Use a projection
(async function () {
  const result = await table.findOne(
    { number_of_pages: { $lt: 300 } },
    { projection: { "*": true } },
  );

  console.log(result);
})();
