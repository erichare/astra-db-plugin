import { DataAPIClient, SomeRow, Table } from "@datastax/astra-db-ts";

// Get an existing database
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

const tableDefinition = Table.schema({
  // Define all of the columns in the table
  columns: {
    title: "text",
    number_of_pages: "int",
    rating: "float",
    genres: { type: "set", valueType: "text" },
    metadata: {
      type: "map",
      keyType: "text",
      valueType: "text",
    },
    is_checked_out: "boolean",
    due_date: "date",
  },
  // Define the primary key for the table.
  // In this case, the table uses a single-column primary key.
  primaryKey: {
    partitionBy: ["title"],
  },
});

(async function () {
  // Provide the types and the definition to create the table
  const table = await database.createTable<SomeRow>("example_table", {
    definition: tableDefinition,
    keyspace: "**KEYSPACE_NAME**",
  });
})();
