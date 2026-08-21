import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Insert rows into the table
(async function () {
  const result = await table.insertMany([
    {
      // This map has non-string keys,
      // so the insertion is an array of key-value pairs
      map_column_int_str: [
        [1, "value1"],
        [2, "value2"],
      ],
      // This map does not have non-string keys,
      // so the insertion does not need to be an array of key-value pairs
      map_column_str_str: {
        key1: "value1",
        key2: "value2",
      },
      title: "Once in a Living Memory",
      author: "Kayla McMaster",
    },
  ]);
})();
