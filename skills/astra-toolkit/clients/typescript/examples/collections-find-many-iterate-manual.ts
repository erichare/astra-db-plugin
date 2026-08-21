import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Create the filter
const filter = {
  $and: [{ is_checked_out: false }, { number_of_pages: { $lt: 300 } }],
};

(async function () {
  // Get the first page
  const cursor1 = collection.find(filter);
  const page1 = await cursor1.fetchNextPage();
  const results1 = page1.result;
  for (const document of results1) {
    console.log(document);
  }
  const paginationState1 = page1.nextPageState;

  // Get the next page
  if (paginationState1) {
    const cursor2 = collection.find(filter, {
      initialPageState: paginationState1,
    });
    const page2 = await cursor2.fetchNextPage();
    const results2 = page2.result;
    for (const document of results2) {
      console.log(document);
    }
    const paginationState2 = page2.nextPageState;
  }
})();
