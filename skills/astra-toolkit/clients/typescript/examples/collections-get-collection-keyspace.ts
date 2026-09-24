import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

// Define the type for the collection
interface User {
  name: string;
  age?: number;
}

// Get a collection
(async function () {
  const collection = await database.collection<User>("**COLLECTION_NAME**", {
    keyspace: "**KEYSPACE_NAME**",
  });
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db(process.env.ASTRA_DB_API_ENDPOINT!, {
  token: process.env.ASTRA_DB_APPLICATION_TOKEN!,
});

// Get a collection
(async function () {
  const collection = await database.collection("**COLLECTION_NAME**", {
    keyspace: "**KEYSPACE_NAME**",
  });
})();
