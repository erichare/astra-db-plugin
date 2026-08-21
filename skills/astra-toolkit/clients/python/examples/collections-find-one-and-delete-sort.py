from astrapy import DataAPIClient
from astrapy.constants import SortMode

# Get an existing collection
client = DataAPIClient()
database = client.get_database(
    "**API_ENDPOINT**", token="**APPLICATION_TOKEN**"
)
collection = database.get_collection("**COLLECTION_NAME**")

# Find a document
result = collection.find_one_and_delete(
    {"metadata.language": "English"},
    sort={
        "rating": SortMode.ASCENDING,
        "title": SortMode.DESCENDING,
    },
)

print(result)
