import { DataAPIClient, LexicalDoc, VectorizeDoc } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient("**APPLICATION_TOKEN**");
const database = client.db("**API_ENDPOINT**");

// Define the type for the collection
interface User extends VectorizeDoc, LexicalDoc {
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
        service: {
          provider: "nvidia",
          modelName: "nvidia/nv-embedqa-e5-v5",
        },
      },
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
      rerank: {
        enabled: true,
        service: {
          provider: "nvidia",
          modelName: "nvidia/llama-3.2-nv-rerankqa-1b-v2",
        },
      },
    },
  );
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient } from "@datastax/astra-db-ts";

// Get a database
const client = new DataAPIClient("**APPLICATION_TOKEN**");
const database = client.db("**API_ENDPOINT**");

(async function () {
  const collection = await database.createCollection("**COLLECTION_NAME**", {
    vector: {
      dimension: 1024,
      metric: "cosine",
      service: {
        provider: "nvidia",
        modelName: "nvidia/nv-embedqa-e5-v5",
      },
    },
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
    rerank: {
      enabled: true,
      service: {
        provider: "nvidia",
        modelName: "nvidia/llama-3.2-nv-rerankqa-1b-v2",
      },
    },
  });
})();
