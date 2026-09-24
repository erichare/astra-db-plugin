import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

// Drop a user-defined type
(async function () {
  await database.alterType("member", {
    operation: {
      rename: {
        fields: {
          name: "first_name",
          is_active: "is_member",
        },
      },
    },
  });
})();
