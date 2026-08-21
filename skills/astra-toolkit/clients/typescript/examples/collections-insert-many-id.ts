import {
  DataAPIClient,
  CollectionInsertManyError,
  UUID,
  ObjectId,
  uuid,
  oid,
} from "@datastax/astra-db-ts";

// Get an existing collection
const client = new DataAPIClient();
const database = client.db("**API_ENDPOINT**", {
  token: "**APPLICATION_TOKEN**",
});
const collection = database.collection("**COLLECTION_NAME**");

// Insert documents into the collection
(async function () {
  try {
    const result = await collection.insertMany([
      {
        name: "Melissa",
        _id: new ObjectId(),
      },
      {
        name: "Jess",
        _id: new ObjectId("65fd9b52d7fabba03349d013"),
      },
      {
        name: "Adam",
        _id: UUID.v4(),
      },
      {
        name: "Beth",
        _id: new UUID("016b1cac-14ce-660e-8974-026c927b9b91"),
      },
      {
        name: "Cathy",
        _id: uuid("bb3def0c-2ff2-43e1-b346-6cf0e5e36f10"),
      },
      {
        name: "Debra",
        _id: oid("67ea409a5e6499dabe0831bc"),
      },
      {
        name: "Jane",
        _id: 1,
      },
      {
        name: "Bobby",
        _id: "b_023",
      },
    ]);
  } catch (error) {
    if (error instanceof CollectionInsertManyError) {
      console.log(error.insertedIds());
    }
  }
})();
