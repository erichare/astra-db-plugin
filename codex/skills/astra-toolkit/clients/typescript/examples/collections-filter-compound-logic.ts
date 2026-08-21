import { DataAPIClient } from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Find a document
(async function () {
  const result = await collection.findOne({
    $and: [
      {
        $or: [{ is_checked_out: false }, { number_of_pages: { $lt: 300 } }],
      },
      {
        $or: [
          { genres: { $in: ["Fantasy", "Romance"] } },
          { publication_year: { $gte: 2002 } },
        ],
      },
    ],
  });

  console.log(result);
})();
