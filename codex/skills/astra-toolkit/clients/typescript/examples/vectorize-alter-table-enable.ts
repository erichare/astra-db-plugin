// tag::imports[]
import { DataAPIClient } from "@datastax/astra-db-ts";
// end::imports[]

// tag::init[]

// Get an existing table
const client = new DataAPIClient("APPLICATION_TOKEN");
const database = client.db("API_ENDPOINT");
const table = database.table("TABLE_NAME");
// end::init[]

// tag::add-external-provider[]

// Define the columns and primary key for the table
(async function () {
  await table.alter({
    operation: {
      addVectorize: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            provider: '{embedding-provider-name-api}',
            modelName: 'MODEL_NAME',
            authentication: {
              providerKey: 'API_KEY_NAME',
            },
          },
        },
      },
    },
  });
})();
// end::add-external-provider[]

// tag::add-hugging-face-dedicated[]

// Define the columns and primary key for the table
(async function () {
  await table.alter({
    operation: {
      addVectorize: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            provider: '{embedding-provider-name-api}',
            modelName: '{embedding-provider-model-name-api}',
            authentication: {
              providerKey: 'API_KEY_NAME',
            },
            parameters: {
              endpointName: 'ENDPOINT_NAME',
              regionName: 'REGION',
              cloudName: 'CLOUD_PROVIDER',
            },
          },
        },
      },
    },
  });
})();
// end::add-hugging-face-dedicated[]

// tag::add-openai[]

// Define the columns and primary key for the table
(async function () {
  await table.alter({
    operation: {
      addVectorize: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            provider: '{embedding-provider-name-api}',
            modelName: 'MODEL_NAME}',
            authentication: {
              providerKey: 'API_KEY_NAME',
            },
            parameters: {
              organizationId: 'ORGANIZATION_ID',
              projectId: 'PROJECT_ID',
            },
          },
        },
      },
    },
  });
})();
// end::add-openai[]

// tag::add-azure-openai[]

// Define the columns and primary key for the table
(async function () {
  await table.alter({
    operation: {
      addVectorize: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            provider: '{embedding-provider-name-api}',
            modelName: 'MODEL_NAME',
            authentication: {
              providerKey: 'API_KEY_NAME',
            },
            parameters: {
              resourceName: 'RESOURCE_NAME',
              deploymentId: 'DEPLOYMENT_ID',
            },
          },
        },
      },
    },
  });
})();
// end::add-azure-openai[]

// tag::add-hosted-provider[]

// Define the columns and primary key for the table
(async function () {
  await table.alter({
    operation: {
      addVectorize: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            provider: '{embedding-provider-name-api}',
            modelName: '{embedding-provider-model-name-api}',
          },
        },
      },
    },
  });
})();
// end::add-hosted-provider[]
