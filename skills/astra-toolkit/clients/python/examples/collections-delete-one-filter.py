from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Delete a document
result = collection.delete_one(
    {
        "$and": [
            {"is_checked_out": False},
            {"number_of_pages": {"$lt": 300}},
        ]
    }
)

print(result)
