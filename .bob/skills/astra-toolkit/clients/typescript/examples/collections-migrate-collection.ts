import {
  DataAPIClient,
  CollectionInsertManyError,
} from "@datastax/astra-db-ts";

const client = new DataAPIClient("APPLICATION_TOKEN");
const database = client.db("API_ENDPOINT");

const oldCollection = database.collection("OLD_COLLECTION_NAME");
const newCollection = database.collection("NEW_COLLECTION_NAME");

let pageState: string | null = null;
let migratedCount = 0;

// Use an empty filter to migrate all documents
const filter = {};

// You must explicitly include $vectorize.
// $vector is excluded by default.
// _id and any other fields that don't start with $ are included by default.
const projection = { $vectorize: true };

(async function () {
  while (true) {
    const cursor = oldCollection.find(filter, {
      projection,
      ...(pageState ? { initialPageState: pageState } : {}),
    });

    const page = await cursor.fetchNextPage();
    const documents = page.result;
    pageState = page.nextPageState;

    if (!documents.length) {
      console.log("No more documents. Migration complete.");
      break;
    }

    // Insert the documents to the new collection.
    // _id and the other field values (excluding $vector) will be the same.
    // $vector will automatically be generated based on the value of $vectorize.
    try {
      await newCollection.insertMany(documents);
    } catch (error) {
      if (error instanceof CollectionInsertManyError) {
        console.log(error.insertedIds());
      }
    }

    migratedCount += documents.length;

    console.log(
      `Migrated ${migratedCount} documents. Page state: ${pageState}`,
    );

    if (!pageState) {
      console.log("Reached final page. Migration complete.");
      break;
    }
  }
})();
