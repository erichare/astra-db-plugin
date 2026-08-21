import { DataAPIClient, TableInsertManyError } from "@datastax/astra-db-ts";

const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});

const table = database.table("**TABLE_NAME**");

let pageState = null;
let migratedCount = 0;

// Use an empty filter to find all rows
const filter = {};

// You must include ALL primary key columns for your table
const primaryKeyColumns = ["**PRIMARY_KEY_1**", "**PRIMARY_KEY_2**"];

const originalTextColumn = "**NAME_OF_ORIGINAL_TEXT_COLUMN**";

const newVectorColumn = "**NAME_OF_NEW_VECTOR_COLUMN**";

// The projection should include ALL primary key columns
// and the column that stores the original text
const projection = {
  ...Object.fromEntries(primaryKeyColumns.map((column) => [column, true])),
  [originalTextColumn]: true,
};

(async function () {
  while (true) {
    const cursor = table.find(filter, {
      projection,
      ...(pageState ? { initialPageState: pageState } : {}),
    });

    const page = await cursor.fetchNextPage();
    const rows = page.result;
    pageState = page.nextPageState;

    if (!rows.length) {
      console.log("No more rows. Migration complete.");
      break;
    }

    // Build the updates
    let updatedRows = [];
    for (const row of rows) {
      const text = row[originalTextColumn];
      if (text) {
        const updatedRow = {
          // Include the full primary key
          ...Object.fromEntries(
            primaryKeyColumns.map((column) => [column, row[column]]),
          ),

          // Set the new vector column to the original text
          [newVectorColumn]: text,
        };
        updatedRows.push(updatedRow);
      }
    }

    try {
      // Inserting a row with a primary key that already exists in the table will
      // overwrite the specified column but leave unspecified columns unchanged.
      await table.insertMany(rows);
    } catch (error) {
      if (error instanceof TableInsertManyError) {
        console.log(error.insertedIds());
      }
    }

    migratedCount += rows.length;

    console.log(
      "Migrated " + migratedCount + " rows. Page state: " + pageState,
    );

    if (!pageState) {
      console.log("Reached final page. Migration complete.");
      break;
    }
  }
})();
