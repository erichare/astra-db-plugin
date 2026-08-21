from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Use a projection
result = collection.find_one(
    {"metadata.language": "English"},
    projection={"is_checked_out": True, "title": True},
)

print(result)

# ==============  BOUNDARY BETWEEN EXAMPLE SNIPPETS  ==============

from astrapy import DataAPIClient

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Use a projection
result = collection.find_one(
    {"metadata.language": "English"},
    projection=["is_checked_out", "title"],
)

print(result)
