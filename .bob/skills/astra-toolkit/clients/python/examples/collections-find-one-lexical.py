from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.find_one(
    {"$lexical": {"$match": "tree hill"}},
    sort={"$lexical": "tree hill grassy"},
)

print(result)
