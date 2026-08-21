import { DataAPIClient, DataAPIBlob } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Insert binary values
(async function () {
  const result = await table.insertOne({
    example_blob: new DataAPIBlob({ $binary: "PfvnbT7peNU/Sfvn" }),
    another_example_blob: new DataAPIBlob(Buffer.from([0x0, 0x1, 0x2])),
    title: "Example",
  });
})();
