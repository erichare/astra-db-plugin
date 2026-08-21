from astrapy import DataAPIClient, exceptions

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Count documents
try:
    result = collection.count_documents(
        {
            "$and": [
                {"is_checked_out": False},
                {"number_of_pages": {"$lt": 300}},
            ]
        },
        upper_bound=500,
    )
    print(result)
except exceptions.TooManyDocumentsToCountException:
    print("Number of documents exceeds upper bound or API limit")
