from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Replace a document
result = collection.replace_one(
    {
        "$and": [
            {"is_checked_out": False},
            {"number_of_pages": {"$lt": 300}},
        ]
    },
    {"is_checked_out": True, "borrower": "Brook Reed"},
    upsert=True,
)

print(result)
