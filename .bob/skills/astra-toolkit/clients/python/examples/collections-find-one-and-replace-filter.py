from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Replace a document
result = collection.find_one_and_replace(
    {
        "$and": [
            {"is_checked_out": False},
            {"number_of_pages": {"$lt": 300}},
        ]
    },
    {"is_checked_out": True, "borrower": "Brook Reed"},
)

print(result)
