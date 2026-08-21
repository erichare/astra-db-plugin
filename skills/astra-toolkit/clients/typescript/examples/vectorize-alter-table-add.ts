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
      add: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            type: "vector",
            dimension: MODEL_DIMENSIONS,
            service: {
              provider: '{embedding-provider-name-api}',
              modelName: 'MODEL_NAME',
              authentication: {
                providerKey: 'API_KEY_NAME',
              },
            },
          },
          // If you want to store the original text
          // in addition to the generated embeddings
          // you must create a separate column.
          TEXT_COLUMN_NAME: "text",
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
      add: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            type: "vector",
            dimension: MODEL_DIMENSIONS,
            service: {
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
          // If you want to store the original text
          // in addition to the generated embeddings
          // you must create a separate column.
          TEXT_COLUMN_NAME: "text",
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
      add: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            type: "vector",
            dimension: MODEL_DIMENSIONS,
            service: {
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
          // If you want to store the original text
          // in addition to the generated embeddings
          // you must create a separate column.
          TEXT_COLUMN_NAME: "text",
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
      add: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            type: "vector",
            dimension: MODEL_DIMENSIONS,
            service: {
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
          // If you want to store the original text
          // in addition to the generated embeddings
          // you must create a separate column.
          TEXT_COLUMN_NAME: "text",
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
      add: {
        columns: {
          // This column will store vector embeddings.
          // The {embedding-provider-name} integration
          // will automatically generate vector embeddings
          // for any text inserted to this column.
          VECTOR_COLUMN_NAME: {
            type: "vector",
            service: {
              provider: '{embedding-provider-name-api}',
              modelName: '{embedding-provider-model-name-api}',
            },
          },
          // If you want to store the original text
          // in addition to the generated embeddings
          // you must create a separate column.
          TEXT_COLUMN_NAME: "text",
        },
      },
    },
  });
})();
// end::add-hosted-provider[]
