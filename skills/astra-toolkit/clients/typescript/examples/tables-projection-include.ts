import { DataAPIClient } from "@datastax/astra-db-ts";

// Manually define the table schema
interface ExampleSchema {
  title: string;
  author: string;
  is_checked_out?: boolean;
}

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table<ExampleSchema>("**TABLE_NAME**");

// Use a projection
(async function () {
  const result = await table.findOne<
    Pick<ExampleSchema, "is_checked_out" | "title">
  >(
    { number_of_pages: { $lt: 300 } },
    { projection: { is_checked_out: true, title: true } },
  );

  console.log(result);
})();

// ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing table
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const table = database.table("**TABLE_NAME**");

// Use a projection
(async function () {
  const result = await table.findOne(
    { number_of_pages: { $lt: 300 } },
    { projection: { is_checked_out: true, title: true } },
  );

  console.log(result);
})();
