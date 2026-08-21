import {
  DataAPIClient,
  InferTablePrimaryKey,
  InferTableSchema,
  Table,
} from "@datastax/astra-db-ts";

// Get an existing database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

const tableDefinition = Table.schema({
  // Define all of the columns in the table
  columns: {
    example_vector: { type: "vector", dimension: 1024 },
    example_non_vector: "text",
  },
  // Define the primary key for the table.
  // In this case, the table uses a single-column primary key.
  primaryKey: {
    partitionBy: ["example_non_vector"],
  },
});

// Infer the TypeScript-equivalent type of the table's schema and primary key
type TableSchema = InferTableSchema<typeof tableDefinition>;
type TablePrimaryKey = InferTablePrimaryKey<typeof tableDefinition>;

(async function () {
  // Provide the types and the definition
  const table = await database.createTable<TableSchema, TablePrimaryKey>(
    "example_table",
    { definition: tableDefinition },
  );
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient, DataAPIVector, Table } from "@datastax/astra-db-ts";

// Get an existing database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

const tableDefinition = Table.schema({
  // Define all of the columns in the table
  columns: {
    example_vector: { type: "vector", dimension: 1024 },
    example_non_vector: "text",
  },
  // Define the primary key for the table.
  // In this case, the table uses a single-column primary key.
  primaryKey: {
    partitionBy: ["example_non_vector"],
  },
});

// Manually define the type of the table's schema and primary key
type TableSchema = {
  example_vector: DataAPIVector;
  example_non_vector: string;
};

type TablePrimaryKey = Pick<TableSchema, "example_non_vector">;

(async function () {
  // Provide the types and the definition to create the table
  const table = await database.createTable<TableSchema, TablePrimaryKey>(
    "example_table",
    { definition: tableDefinition },
  );
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient, SomeRow, Table } from "@datastax/astra-db-ts";

// Get an existing database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

const tableDefinition = Table.schema({
  // Define all of the columns in the table
  columns: {
    example_vector: { type: "vector", dimension: 1024 },
    example_non_vector: "text",
  },
  // Define the primary key for the table.
  // In this case, the table uses a single-column primary key.
  primaryKey: {
    partitionBy: ["example_non_vector"],
  },
});

(async function () {
  // Provide the types and the definition to create the table
  const table = await database.createTable<SomeRow>("example_table", {
    definition: tableDefinition,
  });
})();
