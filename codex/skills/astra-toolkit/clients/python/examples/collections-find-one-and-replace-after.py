from astrapy import DataAPIClient
from astrapy.constants import ReturnDocument

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Replace a document
result = collection.find_one_and_replace(
    {"_id": "101"},
    {"is_checked_out": True, "borrower": "Brook Reed"},
    return_document=ReturnDocument.AFTER,
)

print(result)
