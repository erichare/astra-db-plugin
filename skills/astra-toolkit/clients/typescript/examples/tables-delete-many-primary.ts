import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Delete rows
(async function () {
  const result = await table.deleteMany({
    title: "Hidden Shadows of the Past",
    author: "John Anthony",
  });

  console.log(result);
})();
