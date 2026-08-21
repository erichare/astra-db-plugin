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
            {"title": "Into Shadows of Tomorrow"},
            {"author": "Nicole Wright"},
        ]
    },
    {"$pop": {"genres": -1}},
)

print(result)
