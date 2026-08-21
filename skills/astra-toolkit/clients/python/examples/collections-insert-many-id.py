from astrapy import DataAPIClient
from astrapy.ids import UUID, ObjectId

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert documents into the collection
result = collection.insert_many(
    [
        {
            "name": "Melissa",
            "_id": ObjectId("6672e1cbd7fabb4e5493916f"),
        },
        {
            "name": "Jess",
            "_id": UUID("1ef2e42c-1fdb-6ad6-aae4-e84679831739"),
        },
        {
            "name": "Jane",
            "_id": 1,
        },
        {
            "name": "Bobby",
            "_id": "b_023",
        },
    ]
)
