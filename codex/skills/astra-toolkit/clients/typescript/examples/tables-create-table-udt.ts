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
    id: "uuid",
    group_leader: {
      type: "userDefined",
      udtName: "person",
    },
    group_members: {
      type: "set",
      valueType: {
        type: "userDefined",
        udtName: "person",
      },
    },
    group_roles: {
      type: "map",
      keyType: "text",
      valueType: {
        type: "userDefined",
        udtName: "person",
      },
    },
  },
  // Define the primary key for the table.
  primaryKey: {
    partitionBy: ["id"],
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

import { DataAPIClient, DataAPIDate, Table, UUID } from "@datastax/astra-db-ts";

// Get an existing database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

const tableDefinition = Table.schema({
  // Define all of the columns in the table
  columns: {
    id: "uuid",
    group_leader: {
      type: "userDefined",
      udtName: "person",
    },
    group_members: {
      type: "set",
      valueType: {
        type: "userDefined",
        udtName: "person",
      },
    },
    group_roles: {
      type: "map",
      keyType: "text",
      valueType: {
        type: "userDefined",
        udtName: "person",
      },
    },
  },
  // Define the primary key for the table.
  primaryKey: {
    partitionBy: ["id"],
  },
});

// Manually define the type of the table's schema and primary key
type Person = { name: string; level: number };
type TableSchema = {
  id: UUID;
  group_leader: Person;
  group_members: Set<Person>;
  group_roles: Map<string, Person>;
};
type TablePrimaryKey = Pick<TableSchema, "id">;

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
    id: "uuid",
    group_leader: {
      type: "userDefined",
      udtName: "person",
    },
    group_members: {
      type: "set",
      valueType: {
        type: "userDefined",
        udtName: "person",
      },
    },
    group_roles: {
      type: "map",
      keyType: "text",
      valueType: {
        type: "userDefined",
        udtName: "person",
      },
    },
  },
  // Define the primary key for the table.
  primaryKey: {
    partitionBy: ["id"],
  },
});

(async function () {
  // Provide the types and the definition to create the table
  const table = await database.createTable<SomeRow>("example_table", {
    definition: tableDefinition,
  });
})();
