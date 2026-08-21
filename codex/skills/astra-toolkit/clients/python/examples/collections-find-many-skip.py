from astrapy import DataAPIClient
from astrapy.constants import SortMode

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find documents
cursor = collection.find(
    {"metadata.language": "English"},
    sort={
        "rating": SortMode.ASCENDING,
        "title": SortMode.DESCENDING,
    },
    skip=5,
)

# Iterate over the found documents
for document in cursor:
    print(document)
