from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Insert a document into the collection
result = collection.insert_one(
    {
        "_id": 1,
        "name": "Jane Doe",
    },
)
