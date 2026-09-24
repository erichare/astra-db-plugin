import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

// Drop a user-defined type
(async function () {
  await database.createType("member", {
    definition: {
      fields: {
        name: "text",
        is_active: "boolean",
        date_joined: "date",
      },
    },
    ifNotExists: true,
  });
})();
