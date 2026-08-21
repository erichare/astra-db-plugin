import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Update a row
(async function () {
  await table.updateOne(
    {
      title: "Chemistry Club",
    },
    {
      $set: {
        president: {
          email: "lisa@example.com",
          user_name: "lisa_m",
        },
        vice_president: {
          email: "tanya@example.com",
          user_name: "tanya_o",
        },
      },
    },
  );
})();
