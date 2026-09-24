import os
from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert a document into the collection
result = collection.insert_one(
    {
        "_id": 1,
        "name": "Jane Doe",
    },
)
