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
      title: "Hidden Shadows of the Past",
      author: "John Anthony",
    },
    {
      $set: {
        // This map has non-string keys,
        // so the update is an array of key-value pairs
        map_column_int_str: [
          [1, "value1"],
          [2, "value2"],
        ],
        // This map does not have non-string keys,
        // so the update does not need to be an array of key-value pairs
        map_column_str_str: {
          key1: "value1",
          key2: "value2",
        },
      },
    },
  );
})();
