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
            {
                "$or": [
                    {"is_checked_out": False},
                    {"number_of_pages": {"$lt": 300}},
                ]
            },
            {
                "$or": [
                    {"genres": {"$in": ["Fantasy", "Romance"]}},
                    {"publication_year": {"$gte": 2002}},
                ]
            },
        ]
    }
)

print(result)
