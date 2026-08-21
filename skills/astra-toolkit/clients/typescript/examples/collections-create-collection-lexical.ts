import { DataAPIClient, LexicalDoc } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient("APPLICATION_TOKEN");
const database = client.db("API_ENDPOINT");

// Define the type for the collection
interface User extends LexicalDoc {
  name: string;
  age?: number;
}

(async function () {
  const collection = await database.createCollection<User>("COLLECTION_NAME", {
    lexical: {
      enabled: true,
      analyzer: {
        tokenizer: {
          name: "standard",
          args: {},
        },
        filters: [
          {
            name: "lowercase",
          },
          {
            name: "stop",
          },
          {
            name: "porterstem",
          },
          {
            name: "asciifolding",
          },
        ],
        charFilters: [],
      },
    },
  });
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient("APPLICATION_TOKEN");
const database = client.db("API_ENDPOINT");

(async function () {
  const collection = await database.createCollection("COLLECTION_NAME", {
    lexical: {
      enabled: true,
      analyzer: {
        tokenizer: {
          name: "standard",
          args: {},
        },
        filters: [
          {
            name: "lowercase",
          },
          {
            name: "stop",
          },
          {
            name: "porterstem",
          },
          {
            name: "asciifolding",
          },
        ],
        charFilters: [],
      },
    },
  });
})();
