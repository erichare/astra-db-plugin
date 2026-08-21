from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Update a document
result = collection.update_one(
    {
        "$and": [
            {"title": "Name of the Mountain"},
            {"author": "Gina Marlin"},
        ]
    },
    {"$setOnInsert": {"rating": 5.0, "is_checked_out": False}},
    upsert=True,
)

print(result)
