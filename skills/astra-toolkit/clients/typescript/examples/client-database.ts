import { DataAPIClient } from "@datastax/astra-db-ts";

const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
