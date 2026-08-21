// tag::imports-inferred[]
import {
  DataAPIClient,
  InferTablePrimaryKey,
  InferTableSchema,
  Table,
} from "@datastax/astra-db-ts";
// end::imports-inferred[]

// tag::imports-typed[]
import { DataAPIClient, DataAPIVector, Table } from "@datastax/astra-db-ts";
// end::imports-typed[]

// tag::imports-untyped[]
import { DataAPIClient, SomeRow, Table } from "@datastax/astra-db-ts";
// end::imports-untyped[]

// tag::pre-table-definition[]

// Instantiate the client
const client = new DataAPIClient();

// Connect to a database
const database = client.db("API_ENDPOINT", {
  token: "APPLICATION_TOKEN",
});
// end::pre-table-definition[]

// tag::table-definition-external-provider[]

// Define the columns and primary key for the table
const tableDefinition = Table.schema({
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
  // You should change the primary key definition to meet the needs of your data.
  primaryKey: {
    partitionBy: ["TEXT_COLUMN_NAME"],
  },
});
// end::table-definition-external-provider[]

// tag::table-definition-hugging-face-dedicated[]

// Define the columns and primary key for the table
const tableDefinition = Table.schema({
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
  // You should change the primary key definition to meet the needs of your data.
  primaryKey: {
    partitionBy: ["TEXT_COLUMN_NAME"],
  },
});
// end::table-definition-hugging-face-dedicated[]

// tag::table-definition-openai[]

// Define the columns and primary key for the table
const tableDefinition = Table.schema({
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
  // You should change the primary key definition to meet the needs of your data.
  primaryKey: {
    partitionBy: ["TEXT_COLUMN_NAME"],
  },
});
// end::table-definition-openai[]

// tag::table-definition-azure-openai[]

// Define the columns and primary key for the table
const tableDefinition = Table.schema({
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
  // You should change the primary key definition to meet the needs of your data.
  primaryKey: {
    partitionBy: ["TEXT_COLUMN_NAME"],
  },
});
// end::table-definition-azure-openai[]

// tag::table-definition-hosted-provider[]

// Define the columns and primary key for the table
const tableDefinition = Table.schema({
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
  // You should change the primary key definition to meet the needs of your data.
  primaryKey: {
    partitionBy: ["TEXT_COLUMN_NAME"],
  },
});
// end::table-definition-hosted-provider[]

// tag::infer-type[]

// Infer the TypeScript-equivalent type of the table's schema and primary key
type TableSchema = InferTableSchema<typeof tableDefinition>;
type TablePrimaryKey = InferTablePrimaryKey<typeof tableDefinition>;
// end::infer-type[]

// tag::define-type[]

// Manually define the type of the table's schema and primary key
type TableSchema = {
  VECTOR_COLUMN_NAME: DataAPIVector,
  TEXT_COLUMN_NAME: string;
};

type TablePrimaryKey = Pick<TableSchema, "TEXT_COLUMN_NAME">;
// end::define-type[]

// tag::create-table-and-index-external-typed[]

(async function () {
  const table = await database.createTable<TableSchema, TablePrimaryKey>(
    'TABLE_NAME',
    { definition: tableDefinition },
  );

  // Index the vector column so that you can perform a vector search on it
  await table.createVectorIndex(
    "INDEX_NAME",
    "VECTOR_COLUMN_NAME",
    {
      options: {
        metric: 'SIMILARITY_METRIC',
      },
    },
  );
})();
// end::create-table-and-index-external-typed[]

// tag::create-table-and-index-external-untyped[]

(async function () {
  const table = await database.createTable<SomeRow>(
    'TABLE_NAME',
    { definition: tableDefinition },
  );

  // Index the vector column so that you can perform a vector search on it
  await table.createVectorIndex(
    "INDEX_NAME",
    "VECTOR_COLUMN_NAME",
    {
      options: {
        metric: 'SIMILARITY_METRIC',
      },
    },
  );
})();
// end::create-table-and-index-external-untyped[]

// tag::create-table-and-index-hosted-typed[]

(async function () {
  const table = await database.createTable<TableSchema, TablePrimaryKey>(
    'TABLE_NAME',
    { definition: tableDefinition },
  );

  // Index the vector column so that you can perform a vector search on it
  await table.createVectorIndex(
    "INDEX_NAME",
    "VECTOR_COLUMN_NAME",
    {
      options: {
        metric: 'cosine',
      },
    },
  );
})();
// end::create-table-and-index-hosted-typed[]

// tag::create-table-and-index-hosted-untyped[]

(async function () {
  const table = await database.createTable<SomeRow>(
    'TABLE_NAME',
    { definition: tableDefinition },
  );

  // Index the vector column so that you can perform a vector search on it
  await table.createVectorIndex(
    "INDEX_NAME",
    "VECTOR_COLUMN_NAME",
    {
      options: {
        metric: 'cosine',
      },
    },
  );
})();
// end::create-table-and-index-hosted-untyped[]
