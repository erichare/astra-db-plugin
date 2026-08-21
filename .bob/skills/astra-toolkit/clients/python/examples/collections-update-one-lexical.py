from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Update a document
result = collection.update_one(
    {"$lexical": {"$match": "tree hill"}},
    {"$set": {"color": "blue"}},
    sort={"$lexical": "tree hill grassy"},
)

print(result)
