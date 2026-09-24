import os
from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    os.environ["ASTRA_DB_API_ENDPOINT"], token=os.environ["ASTRA_DB_APPLICATION_TOKEN"]
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find documents
cursor = collection.find_and_rerank(
    sort={"$hybrid": "A tree in the woods"},
    projection={"is_checked_out": True, "title": True},
)

# Iterate over the found documents
for result in cursor:
    # Documents will only have the requested fields
    # (plus '_id' by default projection)
    print(result.document)
