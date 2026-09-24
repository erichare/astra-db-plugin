import os
from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.find_one_and_replace(
    {"metadata.language": "English"},
    {"is_checked_out": True, "borrower": "Brook Reed"},
    projection={"is_checked_out": False, "title": False},
)

print(result)
