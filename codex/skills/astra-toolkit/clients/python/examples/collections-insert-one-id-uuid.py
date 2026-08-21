from astrapy import DataAPIClient
from astrapy.ids import UUID

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert a document into the collection
result = collection.insert_one(
    {
        "_id": UUID("1ef2e42c-1fdb-6ad6-aae4-e84679831739"),
        "name": "Jane Doe",
    },
)
