import { DataAPIClient, escapeFieldNames } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find a document
(async function () {
  const result = await collection.findOneAndReplace(
    {
      $and: [
        { [escapeFieldNames("areas", "r&d")]: false },
        { [escapeFieldNames("costs", "price.usd")]: { $lt: 300 } },
      ],
    },
    {
      areas: {
        "r&d": false,
        design: true,
      },
      costs: {
        "price.usd": 100,
        "price.cad": 90,
      },
    },
    {
      projection: {
        [escapeFieldNames("areas", "r&d")]: true,
        [escapeFieldNames("costs", "price.usd")]: true,
      },
      sort: {
        [escapeFieldNames("areas", "r&d")]: 1,
        [escapeFieldNames("costs", "price.usd")]: -1,
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
  const result = await collection.findOneAndReplace(
    {
      $and: [{ "areas.r&&d": false }, { "costs.price&.usd": { $lt: 300 } }],
    },
    {
      areas: {
        "r&d": false,
        design: true,
      },
      costs: {
        "price.usd": 100,
        "price.cad": 90,
      },
    },
    {
      projection: { "areas.r&&d": true, "costs.price&.usd": true },
      sort: {
        "areas.r&&d": 1,
        "costs.price&.usd": -1,
      },
    },
  );

  console.log(result);
})();
