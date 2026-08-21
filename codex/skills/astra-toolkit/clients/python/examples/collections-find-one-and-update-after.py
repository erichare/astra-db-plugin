from astrapy import DataAPIClient
from astrapy.constants import ReturnDocument

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Update a document
result = collection.find_one_and_update(
    {"_id": "101"},
    {"$set": {"color": "blue"}},
    return_document=ReturnDocument.AFTER,
)

print(result)
