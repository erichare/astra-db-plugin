from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.find_one(
    {
        "$and": [
            {"number_of_pages": {"$lt": 300}},
            {"number_of_pages": {"$gte": 200}},
        ]
    }
)

print(result)
