import { DataAPIClient, escapeFieldNames } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find a document
(async function () {
  const result = await collection.updateMany(
    {
      $and: [
        { [escapeFieldNames("areas", "r&d")]: false },
        { [escapeFieldNames("costs", "price.usd")]: { $lt: 300 } },
      ],
    },
    {
      $set: {
        [escapeFieldNames("areas", "r&d")]: true,
        [escapeFieldNames("costs", "price.usd")]: 310,
      },
    },
  );

  console.log(result);
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
  const result = await collection.updateMany(
    {
      $and: [{ "areas.r&&d": false }, { "costs.price&.usd": { $lt: 300 } }],
    },
    {
      $set: {
        "areas.r&&d": true,
        "costs.price&.usd": 310,
      },
    },
  );

  console.log(result);
})();
