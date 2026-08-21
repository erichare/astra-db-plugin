import { DataAPIClient, VectorDoc } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Define the type for the collection
interface User extends VectorDoc {
  name: string;
  age?: number;
}

(async function () {
  const collection = await database.createCollection<User>(
    "**COLLECTION_NAME**",
    {
      vector: {
        dimension: 1024,
        metric: "cosine",
        sourceModel: "nv-qa-4",
      },
    },
  );
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

(async function () {
  const collection = await database.createCollection("**COLLECTION_NAME**", {
    vector: {
      dimension: 1024,
      metric: "cosine",
      sourceModel: "nv-qa-4",
    },
  });
})();
