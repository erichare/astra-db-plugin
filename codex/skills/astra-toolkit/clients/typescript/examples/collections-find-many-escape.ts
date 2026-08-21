import { DataAPIClient, escapeFieldNames } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find a document
(async function () {
  const cursor = collection.find(
    {
      $and: [
        { [escapeFieldNames("areas", "r&d")]: false },
        { [escapeFieldNames("costs", "price.usd")]: { $lt: 300 } },
      ],
    },
    {
      sort: {
        [escapeFieldNames("costs", "price.usd")]: 1, // ascending
      },
      projection: {
        [escapeFieldNames("areas", "r&d")]: true,
        [escapeFieldNames("costs", "price.cad")]: true,
      },
    },
  );

  // Iterate over the found documents
  for await (const document of cursor) {
    console.log(document);
  }
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find a document
(async function () {
  const cursor = collection.find(
    {
      $and: [{ "areas.r&&d": false }, { "costs.price&.usd": { $lt: 300 } }],
    },
    {
      sort: {
        "costs.price&.usd": 1, // ascending
      },
      projection: {
        "areas.r&&d": true,
        "costs.price&.cad": true,
      },
    },
  );

  // Iterate over the found documents
  for await (const document of cursor) {
    console.log(document);
  }
})();
