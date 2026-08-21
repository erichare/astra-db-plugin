import { DataAPIClient, ObjectId } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

// Define the type for the collection
interface User {
  _id: ObjectId;
  name: string;
  age?: number;
}

(async function () {
  const collection = await database.createCollection<User>(
    "**COLLECTION_NAME**",
    {
      defaultId: {
        type: "objectId",
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
    defaultId: {
      type: "objectId",
    },
  });
})();
