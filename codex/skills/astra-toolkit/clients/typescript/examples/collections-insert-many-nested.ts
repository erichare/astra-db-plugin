import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Insert documents into the collection
(async function () {
  const result = await collection.insertMany([
    {
      title: "Hidden Shadows of the Past",
      genres: ["Biography", "Graphic Novel", "Dystopian", "Drama"],
      metadata: {
        isbn: "978-1-905585-40-3",
        language: "French",
        edition: "Anniversary Edition",
      },
    },
    {
      title: "Bake a Dozen",
      genres: ["Biography", "Fiction"],
      metadata: {
        isbn: "342-2-875587-50-2",
        language: "English",
        edition: "Illustrated Edition",
      },
    },
  ]);
})();
