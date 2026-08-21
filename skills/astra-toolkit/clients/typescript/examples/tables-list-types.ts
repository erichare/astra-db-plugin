import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// List type metadata
(async function () {
  const result = await database.listTypes({ nameOnly: false });

  console.log(result);
})();
