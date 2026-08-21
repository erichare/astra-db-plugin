import {
  DataAPIClient,
  TooManyDocumentsToCountError,
} from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  try {
    // Count documents
    const result = await collection.countDocuments({}, 500);

    console.log(result);
  } catch (error) {
    if (error instanceof TooManyDocumentsToCountError) {
      console.log("Number of documents exceeds upper bound or API limit");
    } else {
      throw error;
    }
  }
})();
