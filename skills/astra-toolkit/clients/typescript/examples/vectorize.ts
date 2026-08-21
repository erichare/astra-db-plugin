// tag::pre-collection-definition[]
import { DataAPIClient } from "@datastax/astra-db-ts";

// Instantiate the client
const client = new DataAPIClient();

// Connect to a database
const database = client.db("API_ENDPOINT", {
  token: "APPLICATION_TOKEN",
});
// end::pre-collection-definition[]

// tag::type-definition[]

// Define the type for the collection
interface User extends VectorizeDoc {
  name: string,
  age?: number,
}
// end::type-definition[]

// tag::collection-definition-external-provider[]

// Define the collection
const collection_definition = {
  vector: {
    dimension: MODEL_DIMENSIONS,
    metric: "SIMILARITY_METRIC",
    service: {
      provider: "{embedding-provider-name-api}",
      modelName: "MODEL_NAME",
      authentication: {
        providerKey: "API_KEY_NAME",
      },
    },
  },
};
// end::collection-definition-external-provider[]

// tag::collection-definition-hugging-face-dedicated[]

// Define the collection
const collection_definition = {
  vector: {
    dimension: MODEL_DIMENSIONS,
    metric: "SIMILARITY_METRIC",
    service: {
      provider: "{embedding-provider-name-api}",
      modelName: "{embedding-provider-model-name-api}",
      authentication: {
        providerKey: "API_KEY_NAME",
      },
      parameters: {
        endpointName: "ENDPOINT_NAME",
        regionName: "REGION",
        cloudName: "CLOUD_PROVIDER",
      },
    },
  },
};
// end::collection-definition-hugging-face-dedicated[]

// tag::collection-definition-openai[]

// Define the collection
const collection_definition = {
  vector: {
    dimension: MODEL_DIMENSIONS,
    metric: "SIMILARITY_METRIC",
    service: {
      provider: "{embedding-provider-name-api}",
      modelName: "MODEL_NAME",
      authentication: {
        providerKey: "API_KEY_NAME",
      },
      parameters: {
        organizationId: "ORGANIZATION_ID",
        projectId: "PROJECT_ID",
      },
    },
  },
};
// end::collection-definition-openai[]

// tag::collection-definition-azure-openai[]

// Define the collection
const collection_definition = {
  vector: {
    dimension: MODEL_DIMENSIONS,
    metric: "SIMILARITY_METRIC",
    service: {
      provider: "{embedding-provider-name-api}",
      modelName: "MODEL_NAME",
      authentication: {
        providerKey: "API_KEY_NAME",
      },
      parameters: {
        resourceName: "RESOURCE_NAME",
        deploymentId: "DEPLOYMENT_ID",
      },
    },
  },
};
// end::collection-definition-azure-openai[]

// tag::collection-definition-hosted-provider[]

// Define the collection
const collection_definition = {
  vector: {
    metric: "cosine",
    service: {
      provider: "{embedding-provider-name-api}",
      modelName: "{embedding-provider-model-name-api}",
    },
  },
};
// end::collection-definition-hosted-provider[]

// tag::post-collection-definition-untyped[]

(async function () {
  // Create the collection
  const collection = await database.createCollection(
    "COLLECTION_NAME",
    collection_definition
  );
})();
// end::post-collection-definition-untyped[]

// tag::post-collection-definition-typed[]

(async function () {
  // Create the collection
  const collection = await database.createCollection<User>(
    "COLLECTION_NAME",
    collection_definition
  );
})();
// end::post-collection-definition-typed[]
