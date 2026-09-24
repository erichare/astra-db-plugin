import os
from astrapy import DataAPIClient
from astrapy.ids import ObjectId

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert a document into the collection
result = collection.insert_one(
    {
        "_id": ObjectId("6672e1cbd7fabb4e5493916f"),
        "name": "Jane Doe",
    },
)
