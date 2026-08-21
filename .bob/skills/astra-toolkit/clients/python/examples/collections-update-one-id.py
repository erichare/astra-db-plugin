from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Update a document
result = collection.update_one(
    {"_id": "101"}, {"$set": {"color": "blue"}}
)

print(result)
