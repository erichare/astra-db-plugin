import crypto from "crypto";
import { DataAPIClient, DataAPIResponseError } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

(async function () {
  // Example document
  const document = {
    title: "Example article",
    content:
      "This is the main text of the document. _id is generated from this field so that this field is never duplicated across documents.",
    source: "https://example.com",
  };

  // Derive a deterministic _id based on the "content" field
  const id = crypto
    .createHash("sha256")
    .update(document.content, "utf8")
    .digest("hex");

  const documentWithId = { ...document, _id: id };

  try {
    const result = await collection.insertOne(documentWithId);
    console.log("Inserted new document with _id:", result.insertedId);
  } catch (error) {
    if (error instanceof DataAPIResponseError) {
      const errors = error.rawResponse?.errors ?? [];
      // Check for DOCUMENT_ALREADY_EXISTS from the Data API error code
      const isDuplicate = errors.some(
        (e) => e.errorCode === "DOCUMENT_ALREADY_EXISTS",
      );

      if (isDuplicate) {
        console.log("Document already exists with this _id; skipping insert.");
        return;
      }
    }

    // Re-throw for any other error
    throw error;
  }
})();
