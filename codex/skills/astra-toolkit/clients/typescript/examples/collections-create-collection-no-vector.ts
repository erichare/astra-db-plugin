import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Define the type for the collection
interface User {
  name: string;
  age?: number;
}

// Create a collection
(async function () {
  const collection = await database.createCollection<User>(
    "**COLLECTION_NAME**",
  );
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Create a collection
(async function () {
  const collection = await database.createCollection("**COLLECTION_NAME**");
})();
