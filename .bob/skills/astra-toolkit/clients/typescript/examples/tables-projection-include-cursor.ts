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
  const result = table
    .find({ number_of_pages: { $lt: 300 } })
    .limit(3)
    .project<Pick<ExampleSchema, "is_checked_out" | "title">>({
      is_checked_out: true,
      title: true,
    });

  for await (const row of result) {
    console.log(row);
  }
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
  const result = table
    .find({ number_of_pages: { $lt: 300 } })
    .limit(3)
    .project({ is_checked_out: true, title: true });

  for await (const row of result) {
    console.log(row);
  }
})();
